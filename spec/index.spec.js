const mocks = require('../src/mocks')
const index = require('../src/index')
const { startMoQL, stopMoQL, moQL, resetMoQL, verifyMoQL } = index

afterEach(resetMoQL)

describe('startMoQL', () => {
  it('starts the server', async () => {
    jest.spyOn(global.console, 'log')

    const actualPort = await startMoQL()

    stopMoQL()
    expect(console.log).toBeCalledWith(
      `📉 moQL server is listening on ${actualPort}.`
    )
  })

  it('complains if you try to start the server twice', () => {
    jest.spyOn(global.console, 'log')

    const promises = Promise.all([
      startMoQL({ port: 7332 }),
      startMoQL({ port: 7332 })
    ])

    return promises
      .catch(() => {
        expect(console.log).toBeCalledWith(
          '📈 moQL server failed to start on 7332.',
          'listen EADDRINUSE: address already in use :::7332'
        )
      })
      .finally(stopMoQL)
  })
})

describe('moQL', () => {
  it('complains about duplicate mocks', () => {
    moQL({
      request: { query: 'test' },
      response: { data: {} }
    })

    expect(() =>
      moQL({
        request: { query: 'test' },
        response: { data: {} }
      })
    ).toThrow(/duplicate/i)
  })

  it('complains about missing query', () => {
    expect(() =>
      moQL({
        request: {},
        response: { data: {} }
      })
    ).toThrow(/missing query/i)
  })

  it('complains about empty query', () => {
    expect(() =>
      moQL({
        request: { query: '{}' },
        response: { data: {} }
      })
    ).toThrow(/empty query/i)
  })
})

describe('verifyMoQL', () => {
  it('also calls resetMoQL', () => {
    jest.spyOn(index, 'resetMoQL')

    verifyMoQL()

    expect(index.resetMoQL).toBeCalled()
  })

  it('complains if mock was unused', () => {
    moQL({
      request: { query: 'test' },
      response: { data: {} }
    })

    expect(verifyMoQL).toThrow(/not used/)
  })
})

describe('resetMoQL', () => {
  it('calls resetMocks', () => {
    moQL({
      request: { query: 'test' },
      response: { data: {} }
    })

    resetMoQL()

    expect(mocks.mocks()).toEqual({})
  })
})
