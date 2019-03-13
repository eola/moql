const { mocks, setMock, unusedMocks, resetMocks } = require('./mocks')
let { app } = require('./app')

let server
const port = 7332 // LEE2

// Start the MoQL server, and return a Promise so you can wait on it.
// E.g. in JEST beforeAll will wait:
//
//   beforeAll(startMoQL)
//
exports.startMoQL = () =>
  new Promise((resolve, reject) => {
    server = app().listen(port, (err) => {
      if (err) {
        console.log("📈 MoQL server failed to start.", err)
        reject()
        return
      }
      resolve()
      console.log(`📉 MoQL server is listening on ${port}`)
    })
  })

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
exports.moQL = ({ request, response }) => {
  if (!request.query) throw 'MoQL missing query!'
  const query = request.query
  const variables = request.variables || {}

  const duplicate = setMock(query, variables)(response)
  if (duplicate) throw `🙅🙅 Duplicate MoQL query! '${duplicate}'`
}

// Reset the MoQL mocks to a clean slate. Ideally run this after every spec.
// Optional, but you'll get tightly coupled specs and confusing results without.
exports.resetMoQL = () => resetMocks()

// Verify all mocks specified were used. Ideally run this after every spec.
// Optional, but useful to ensure specs don't acrue unused mocks.
// Because this is test framework agnosic it just returns an array;
// when empty it's good, when it has stuff in it those are the unused queries.
// This also calls `resetMoQL()` as it doesn't make sense not to when verifying.
//
//   verifyMoQL.length === 0 // pass
//
// Changed my mind it throws now.
exports.verifyMoQL = () => {
  const unused = unusedMocks()
  if (unused) throw `😰 MoQL query not used! '${unused}'`
  exports.resetMoQL() // to be helpful
}

// Stop the MoQL server. Not sure if this is necessary.
exports.stopMoQL = () => server.close()
