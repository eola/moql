const { mocks, setMock, unusedMocks, resetMocks } = require('../src/mocks')

const query = '{queryFoo{}}'
const vars = { a: 2 }
const mock = { data: { foo: 'bar' } }

describe('mocks', () => {
  it('returns an empty object at first', () => {
    expect(mocks()).toEqual({})
  })

  it('returns undefined for missing query', () => {
    expect(mocks('{queryFoo{}}')).toBeUndefined()
  })

  it('returns undefined for missing variables', () => {
    expect(mocks('{queryFoo{}}', { a: 2 })).toBeUndefined()
  })
})

describe('setMock', () => {
  afterEach(resetMocks)

  it('usually returns undefined', () => {
    expect(setMock(query, vars)(mock)).toBeUndefined()
  })

  it('says if a query is a duplicate and does not update it', () => {
    setMock(query, vars)(mock)

    expect(setMock(query, vars)({})).toMatch(query)
    expect(mocks(query, vars).data).toEqual(mock.data)
  })
})

describe('setMock / mocks', () => {
  afterEach(resetMocks)

  it('takes a query & variables and returns a function to set data', () => {
    expect(setMock(query, vars)).toBeInstanceOf(Function)
  })

  it('sets query variables data', () => {
    setMock(query, vars)(mock)

    expect(mocks(query, vars).data).toEqual(mock.data)
  })

  it('initializes countUsed to 0 (internal)', () => {
    setMock(query, vars)(mock)

    expect(mocks(query, vars).countUsed).toBe(0)
  })

  it('initializes count to 1 if undefined', () => {
    setMock(query, vars)(mock)

    expect(mocks(query, vars).count).toBe(1)
  })

  it('leaves count alone if set', () => {
    setMock(query, vars)({ data: {}, count: 2 })

    expect(mocks(query, vars).count).toBe(2)
  })

  it('returns data for missing specific vars if null catch all is used', () => {
    setMock(query, null)(mock)

    expect(mocks(query, vars).data).toEqual(mock.data)
  })
})

describe('setMock / unusedMocks', () => {
  afterEach(resetMocks)

  it('returns undefined for no mocks', () => {
    expect(unusedMocks()).toBeUndefined()
  })

  it('says a set mock was unused', () => {
    setMock(query, vars)(mock)

    expect(unusedMocks()).toMatch(query)
  })

  it('returns undefined for used mocks', () => {
    setMock(query, vars)(mock)
    mocks(query, vars).countUsed += 1

    expect(unusedMocks()).toBeUndefined()
  })
})

describe('resetMocks', () => {
  it('clears mocks', () => {
    setMock(query, vars)(mock)
    expect(mocks()).not.toEqual({})

    resetMocks()

    expect(mocks()).toEqual({})
  })
})
