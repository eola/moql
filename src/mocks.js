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

// The object can be read or mutated as the reference is the same across files.
//
//   mocks()["query"]
//   mocks()["query"]["variables"] = { json: "response" }
//
exports.mocks = function(query, variables) {
  let mock = mocks
  if (query) mock = mock[normalizeQuery(query)]
  if (variables && mock) mock = mock[normalizeVariables(variables)]

  return mock
}

// Set a mock.
//
//   setMock("query", "variables")({ json: "response" })
//
exports.setMock = function(query, variables) {
  const q = normalizeQuery(query)
  const v = normalizeVariables(variables)

  return function(mock) {
    if (!mocks[q]) mocks[q] = {}
    if (mocks[q][v]) return `${query.slice(0, 30)}... ${variables}`
    mocks[q][v] = mock
  }
}

exports.unusedMocks = function() {
  Object.keys(mocks).forEach(query => {
    Object.keys(mocks[query]).forEach(variables => {
      const mock = mocks[query][variables]
      if (mock.countUsed < mock.count) {
        return `${query.slice(0, 30)}... ${variables}`
      }
    })
  })
  return false
}

// We need this method to mutate the reference to a new empty object
// otherwise each file would get its own reference.
exports.resetMocks = function() {
  mocks = {}
  return mocks
}
