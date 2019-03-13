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
  const query = request.body.query
  const variables = request.body.variables || {}

  const mockVariables = mocks(query)
  const mock = mockVariables ? mocks(query, variables) : {}


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
  } else if (mock.count !== null && mock.countUsed >= mock.count) {
    response.send({
      errors: [{
        message: `🔞 MoQL query limit reached! Specified count: ${mock.count}`
      }]
    })
  } else {
    mock.countUsed += 1
    response.send({ data: mock.data })
  }
})

exports.app = () => app
