const { mocks } = require('./mocks')
let express = require('express')
let bodyParser = require('body-parser')

const app = express()

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
  let { query, variables } = request.body

  const mockVariables = mocks(query)
  const mock = mockVariables ? mocks(query, variables) : undefined

  let json
  if (!mockVariables) {
    const message =
      `🔎 No moQL query mocks found! '${query.slice(0, 30)}...'`
    console.log(message)
    console.log('Queries mocked:')
    console.log(Object.keys(mocks()).join('\n\n'))
    json = { errors: [{ message }] }
  } else if (!mock) {
    const message =
      `🤔 No moQL variables mock found! '${JSON.stringify(variables)}'`
    console.log(message)
    console.log('Query variables mocked:')
    console.log(Object.keys(mockVariables).join('\n\n'))
    json = { errors: [{ message }] }
  } else if (mock.count !== null && mock.countUsed >= mock.count) {
    const message =
      `🔞 moQL query limit reached! Specified count: ${mock.count}`
    console.log(message)
    json = { errors: [{ message }] }
  } else {
    mock.countUsed += 1
    json = { data: mock.data }
  }
  response.send(json)
})

exports.app = () => app
