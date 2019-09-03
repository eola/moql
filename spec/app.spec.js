const mocks = require('../src/mocks')
const index = require('../src/index')
const { startMoQL, stopMoQL, moQL, resetMoQL, verifyMoQL } = index
const axios = require('axios')

beforeAll(() => startMoQL({ port: 7333 }))
afterEach(resetMoQL)
afterAll(stopMoQL)

const graphqlRequest = data => axios.post('http://localhost:7333/graphql', data)

// jest.mock('../src/mocks.js', () => {
//   return {
//     ...jest.requireActual('../src/mocks.js'),
//     resetMocks: jest.fn() // already tested
//   }
// })

describe('POST', () => {
  it('returns mocked data for query', () => {
    moQL({
      request: { query: 'test' },
      response: { data: { hello: 'world' } }
    })

    return graphqlRequest({
      query: 'test',
      variables: {}
    }).then(res => {
      expect(res.data).toEqual({ data: { hello: 'world' } })
    })
  })

  it('complains if the query is empty', () => {
    moQL({
      request: { query: 'test' },
      response: { data: { hello: 'world' } }
    })

    return graphqlRequest({
      query: ''
    }).then(res => {
      expect(res.data.errors[0].message).toMatch(/No query specified/)
    })
  })

  it('complains if no query mocks are found', () => {
    moQL({
      request: { query: 'test' },
      response: { data: { hello: 'world' } }
    })

    return graphqlRequest({
      query: 'nope'
    }).then(res => {
      expect(res.data.errors[0].message).toMatch(/No moQL query mocks found/)
    })
  })

  it('complains if there is no variable match', () => {
    moQL({
      request: { query: 'test', variables: { one: 'two' } },
      response: { data: { hello: 'world' } }
    })

    return graphqlRequest({
      query: 'test',
      variables: { eno: 'owt' }
    }).then(res => {
      expect(res.data.errors[0].message).toMatch(/No moQL variables mock found/)
    })
  })

  it('complains if a query is unintentionally re-requested', () => {
    moQL({
      request: { query: 'test' },
      response: { data: { hello: 'world' } }
    })

    return Promise.all([
      graphqlRequest({
        query: 'test',
        variables: {}
      }),
      graphqlRequest({
        query: 'test',
        variables: {}
      })
    ]).then(promises => {
      const res = promises.find(p => p.data.errors)
      expect(res.data.errors[0].message).toMatch(/query limit reached/)
    })
  })

  it('lets a query be deliberately re-requested', () => {
    moQL({
      request: { query: 'test' },
      response: { data: { hello: 'world' }, count: 2 }
    })

    return Promise.all([
      graphqlRequest({
        query: 'test',
        variables: {}
      }),
      graphqlRequest({
        query: 'test',
        variables: {}
      })
    ]).then(promises => {
      promises.forEach(res => expect(res.data.data).toEqual({ hello: 'world' }))
    })
  })

  it('returns array mocks sequentially when re-requested', () => {
    moQL({
      request: { query: 'test' },
      response: [{ data: { hello: 'world' } }, { data: { hola: 'mundo' } }]
    })

    return Promise.all([
      graphqlRequest({
        query: 'test',
        variables: {}
      }),
      graphqlRequest({
        query: 'test',
        variables: {}
      })
    ]).then(promises => {
      const data = promises.map(p => p.data.data)
      expect(data).toContainEqual({ hello: 'world' })
      expect(data).toContainEqual({ hola: 'mundo' })
    })
  })

  it('returns multiple data mocks for batched query', () => {
    moQL({
      request: { query: 'one' },
      response: { data: { hello: 'world' } }
    })
    moQL({
      request: { query: 'two' },
      response: { data: { foo: 'bar' } }
    })

    return graphqlRequest([
      {
        query: 'one',
        variables: {}
      },
      {
        query: 'two',
        variables: {}
      }
    ]).then(res => {
      expect(res.data).toEqual([
        { data: { hello: 'world' } },
        { data: { foo: 'bar' } }
      ])
    })
  })
})
