// Normalize query when mocking & when recieving the request to compare equal.
// Could use the official GraphQL.js to compare, but that seems overkill.
// Must:
//   * Remove all whitespace (too complex to remove in a "valid" way)
//   * Remove optional syntax (e.g. commas in args split over multiple lines)
//   * Remove fields clients might add (e.g. __typename)
exports.normalizeQuery = function(query) {
  return query.replace(/\s+/g, '')        // ignore all whitespace
              .replace(/__typename/g, '') // ignore __typename field
              .replace(/,/g, '')          // ignore argument commas (optional)
}

// Normalize vars when mocking & when recieving the request to compare equal.
// Sorts keys as client may send them in a different order to the mock.
// Then JSON stringifies as this should be consistent here.
exports.normalizeVariables = function(variables) {
  const ordered = {}
  Object.keys(variables).sort().forEach(key => ordered[key] = variables[key])
  return JSON.stringify(ordered)
}
