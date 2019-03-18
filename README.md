<img src="./moQL.png" alt="moQL logo" width="256"/>

[![moql npm version](https://img.shields.io/npm/v/moql.svg)](https://www.npmjs.com/package/moql)

## moQL: Mock GraphQL query server for tests.

From your Jest (or other framework) specs, easilly start a mock GraphQL server, set mock data to return, and verify it was actually requested by your GraphQL client.

### Motivations

#### Real HTTP

Many answers to how to testing apps that use a GraphQL API (React or otherwise) amount to "refactor your code to be more testable, then mock everything syncronously". "Testable" sometimes means easier to understand (and test) code, but it can end up becoming layers of indirection and wasted developer hours. Sometimes we can't refactor the code if it's in a 3rd party library. And finally, you want at least 1 integration test that hits the network right?

#### Framework agnostic

 MoQL should work nicely with any frontend framework, GraphQL client, and test setup. It's just a bunch of methods in a module that you can call from wherever. We're using moQL with React, Apollo, Enzyme JSDOM and Jest.

#### Fast

There's 1 HTTP request per query actually requested (as you'd expect) and very little overhead beyond that. You can start the server just once at the beginning of your spec file (or whole suite) using `beforeAll` or similar.

#### Simple

Not much code, and it doesn't do anything fancy. The only dependency is Express, and it's used lightly.

Conceptually it's just a hash of queries to responces served over HTTP, rather than a fully compliant GraphQL server.

#### Helpful

If an unexpected query was made, it'll tell you. If you expected a query to be made but it wasn't, it tells you that too. Less banging your head on black boxes, more helpful error messages.
