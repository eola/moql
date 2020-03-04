const { mocks } = require('./mocks')
let express = require('express')
let bodyParser = require('body-parser')

const app = express()

// CORS is a pain.
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})
// Express doesn't support body data by defualt?!
app.use(bodyParser.json())

// Look up and return the matching query + variables mock.
app.post('/graphql', (request, response) => {
  const batchedQuery = Array.isArray(request.body)
  const queries = batchedQuery ? request.body : [request.body]
  let json = []

  queries.forEach(({ query, variables }) => {
    const mockVariables = mocks(query)
    const mock = mockVariables ? mocks(query, variables) : undefined

    if (!query || query === '' || query === '{}') {
      const message = `👻 No query specified in request to moQL!`
      console.warn(message)
      json.push({ errors: [{ message }] })
    } else if (!mockVariables) {
      const message = `🔎 No moQL query mocks found! '${query}...'`
      console.warn(message)
      console.log('Queries mocked:')
      console.log(Object.keys(mocks()).join('\n\n'))
      json.push({ errors: [{ message }] })
    } else if (!mock) {
      const message = `🤔 No moQL variables mock found! '${JSON.stringify(
        variables
      )}'`
      console.warn(message)
      console.log('Query variables mocked:')
      console.log(Object.keys(mockVariables).join('\n\n'))
      json.push({ errors: [{ message }] })
    } else if (mock.count !== null && mock.countUsed >= mock.count) {
      const message = `🔞 moQL query limit reached! Specified count: ${mock.count}`
      console.warn(message)
      json.push({ errors: [{ message }] })
    } else {
      json.push(
        Array.isArray(mock.data)
          ? mock.data[mock.countUsed]
          : { data: mock.data }
      )
      mock.countUsed += 1
    }
  })

  response.send(batchedQuery ? json : json[0])
})

exports.app = () => app
