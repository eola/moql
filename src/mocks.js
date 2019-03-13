const { normalizeQuery, normalizeVariables } = require('./helpers')

let mocks = {}
/*
// The structure of `mocks` is:
//   key query string
//     key variables json string
//       value results json object
// E.g:

{
  "query { Posts { title } }": {
    "": { // no variables
      data: {
        "Posts": [
          { "title": "Hello World" },
          { "title": "How to GraphQl" }
        ]
      },
      count: null // unlimited
    },
    "\"draft\": false": {
      data: {
        "Posts": [
          { "title": "Hello World" },
          { "title": "How to GraphQl" }
        ]
      },
      count: 1 // must only be requested once
    }
  }
}
*/

// @returns:
//
//   mocks()                     // all mocks
//   mocks("query")              // variable mocks for the query
//   mocks("query", "variables") // specific mock for the query and variables
//
exports.mocks = function(query, variables) {
  const q = normalizeQuery(query)
  const v = normalizeVariables(variables)

  let mock = mocks
  if (query !== undefined) mock = mock[q]
  if (variables !== undefined && mock) mock = mock[v] || mock[null]
  return mock
}

// Set a mock, handling normalization and not overwriting if it's a duplicate.
// @returns undefined if the mock is not a duplicate (good)
// or a string of information about the duplicate (bad)
//
//   setMock("query", "variables")({ json: "response" }) // => undefined
//
exports.setMock = function(query, variables) {
  const q = normalizeQuery(query)
  const v = normalizeVariables(variables)

  return function(mock) {
    // Set up count & countUsed for simpler comparisons later
    mock.countUsed = 0
    // A missing `count` key defualts to 1 (for "unlimited" pass `count: null`)
    if (mock.count === undefined) mock.count = 1

    if (!mocks[q]) mocks[q] = {} // Careful not to overwrite other mocks
    // Return informations about the mock if it's a duplicate (it's an error)
    if (mocks[q][v]) return `${query.slice(0, 30)}... ${variables}`

    mocks[q][v] = mock
  }
}

// Returns undefined if there were no unused mocks (good)
// or a string of information about any mock that was unused (bad)
exports.unusedMocks = function() {
  Object.keys(mocks).forEach(query => {
    Object.keys(mocks[query]).forEach(variables => {
      const mock = mocks[query][variables]
      if (mock.count !== null && mock.countUsed < mock.count) {
        return `${query.slice(0, 30)}... ${variables}`
      }
    })
  })
}

// We need this method to mutate the reference to a new empty object
// otherwise each file would get its own reference.
exports.resetMocks = function() {
  mocks = {}
  return mocks
}
