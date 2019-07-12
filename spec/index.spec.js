const mocks = require('../src/mocks')
const index = require('../src/index')
const { startMoQL, stopMoQL, moQL, resetMoQL, verifyMoQL } = index

jest.mock('../src/mocks.js', () => {
  return {
    ...jest.requireActual('../src/mocks.js'),
    resetMocks: jest.fn() // already tested
  }
})

describe('startMoQL', () => {
  it('starts the server', async () => {
    jest.spyOn(global.console, 'log')

    await startMoQL()

    expect(console.log).toBeCalledWith(`📉 moQL server is listening on 7332.`)
    stopMoQL()
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
    resetMoQL()

    expect(mocks.resetMocks).toBeCalled()
  })
})
