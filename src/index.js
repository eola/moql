let express = require('express')
let bodyParser = require('body-parser')
let http = require('http')

const port = 7332 // LEE2
const app = express()
let server
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

// CORS is a pain.
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
// Express doesn't support body data by defualt?!
app.use(bodyParser.json())

// Look up and return the matching query + variables mock.
app.post('/graphql', (request, response) => {
  const query = normalizeQuery(request.body.query)
  const variables = normalizeVariables(request.body.variables || {})

  const mockVariables = mocks[query]
  const mock = mockVariables ? mockVariables[variables] : {}

  if (!mock.countUsed) mock.countUsed = 0
  mock.countUsed += 1

  if (!mockVariables) {
    response.send({
      errors: [{
        message: `🔎 No MoQL query mock found! '${query.slice(0, 30)}...'`
      }]
    })
  } else if (!mock) {
    response.send({
      errors: [{
        message: `🤔 No MoQL variables mock found! '${variables}'`
      }]
    })
  } else if (mock.count && mock.countUsed > mock.count) {
    response.send({
      errors: [{
        message: `🔞 MoQL query limit reached! Specified count: ${mock.count}`
      }]
    })
  } else {
    response.send({ data: mock.data })
  }
})

// Normalize query when mocking & when recieving the request to compare equal.
// Could use the official GraphQL.js to compare, but that seems overkill.
// Must:
//   * Remove all whitespace (too complex to remove in a "valid" way)
//   * Remove optional syntax (e.g. commas in args split over multiple lines)
//   * Remove fields clients might add (e.g. __typename)
const normalizeQuery = function(query) {
  return query.replace(/\s+/g, '')        // ignore all whitespace
              .replace(/__typename/g, '') // ignore __typename field
              .replace(/,/g, '')          // ignore argument commas (optional)
}

// Normalize vars when mocking & when recieving the request to compare equal.
// Sorts keys as client may send them in a different order to the mock.
// Then JSON stringifies as this should be consistent here.
const normalizeVariables = function(variables) {
  const ordered = {}
  Object.keys(variables).sort().forEach(key => ordered[key] = variables[key])
  return JSON.stringify(ordered)
}

// Start the MoQL server, and return a Promise so you can wait on it.
// E.g. in JEST beforeAll will wait:
//
//   beforeAll(startMoQL)
//
exports.startMoQL = function() {
  return(
    new Promise((resolve, reject) => {
      server = app.listen(port, (err) => {
        if (err) {
          console.log("📈 MoQL server failed to start.", err)
          reject()
          return
        }
        resolve()
        console.log(`📉 MoQL server is listening on ${port}`)
      })
    })
  )
}

// ✨ The main function. Register a mocked GraphQL query with MoQL.
//
//   request: {
//     query: "{}",               // GraphQL query to mock
//     variables: { foo: "bar" }, // variables to mock (optional if none)
//   },
//   response: {
//     data: { ... } // JSON graphql response your client expects
//   }
//
exports.MoQL = function({ request, response }) {
  const query = normalizeQuery(request.query)
  const variables = normalizeVariables(request.variables || {})

  if (!mocks[query]) mocks[query] = {}
  if (!mocks[query][variables]) {
    mocks[query][variables] = response
  } else {
    throw `🙅🏻‍♀️🙅🏻‍♀️ Duplicate MoQL query! '${query.slice(0, 30)}...'`
  }
}

// Reset the MoQL mocks to a clean slate. Ideally run this after every spec.
// Optional, but you'll get tightly coupled specs and confusing results without.
exports.resetMoQL = function() {
  mocks = {}
}

// Verify all mocks specified were used. Ideally run this after every spec.
// Optional, but useful to ensure specs don't acrue unused mocks.
// Because this is test framework agnosic it just returns an array;
// when empty it's good, when it has stuff in it those are the unused queries.
// This also calls `resetMoQL()` as it doesn't make sense not to when verifying.
//
//   verifyMoQL.length === 0 // pass
//
// Changed my mind it throws now.
exports.verifyMoQL = function() {
  let used = []
  Object.keys(mocks).forEach(query => {
    Object.keys(mocks[query]).forEach(variables => {
      let data = mocks[query][variables]
      if (data.countUsed < data.count) {
        used.concat(data)
        throw `😰 MoQL query not used! '${query.slice(0, 30)}... ${variables}'`
      }
    })
  })
  exports.resetMoQL() // to be helpful
  return used
}

// Stop the MoQL server. Not sure if this is necessary.
exports.stopMoQL = function() {
  server.close()
}
