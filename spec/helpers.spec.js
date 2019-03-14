const { normalizeVariables, normalizeQuery } = require('../src/helpers')

describe('normalizeVariables', () => {
  it('JSON stringifies the variables', () => {
    expect(normalizeVariables({ a: 2 })).toEqual('{"a":2}')
  })

  it('alphabetizes the variables', () => {
    expect(normalizeVariables({ b: 1, a: 2 })).toEqual('{"a":2,"b":1}')
  })

  it('returns null when null', () => {
    expect(normalizeVariables(null)).toBeNull()
  })

  it('returns null when undefined (not sure this is best)', () => {
    expect(normalizeVariables()).toBeNull()
  })
})

describe('normalizeQuery', () => {
  const query = `
    query TimeSlotBookingsQuery(
      $from: ISO8601DateTime, $to: ISO8601DateTime
      $booked: Boolean!
      $outletSlug: String!
      $instructorId: Int
    ) {

      timeSlotBookings(
        from: $from, to: $to,
        limit: 500
        booked: $booked
        outletSlug: $outletSlug
        instructorId: $instructorId
      ) {
        id
        start
        finish
        peopleGoing
        allWaiversAgreed
        activelyBooked
        objectURL
        offer {
          name
          __typename
        }
        timeSlots {
          id
          instructors {
            id
            name
            profilePicture
          }
        }
      }

    }
  `

  it('strips all whitespace', () => {
    expect(normalizeQuery(query)).not.toMatch(' ')
  })

  it('is all on one line', () => {
    expect(normalizeQuery(query)).not.toMatch('\n')
  })

  it('strips optional inconsistent argument commas', () => {
    expect(normalizeQuery(query)).not.toMatch(',')
  })

  it('strips __typename that may be added by a client (Apollo)', () => {
    expect(normalizeQuery(query)).not.toMatch('__typename')
  })
})
