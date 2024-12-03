export const schema = `#graphql
type Vehicle {
  id: ID!
  name: String!
  manufacturer: String!
  year: Int!
  joke: String!
  parts: [Parts!]!
}

type Parts {
  id: ID!
  name: String!
  price: Float!
  vehicleId: ID!
}

type Query {
  vehicles: [Vehicle!]!
  vehicle(id: ID!): Vehicle
  parts: [Parts!]!
  vehiclesByManufacturer(manufacturer: String!): [Vehicle!]!
  partsByVehicle(vehicleId: ID!): [Parts!]!
  vehiclesByYearRange(startYear: Int!, endYear: Int!): [Vehicle!]!
}

type Mutation {
  addVehicle(name: String!, manufacturer: String!, year: Int!): Vehicle!
  addPart(name: String!, price: Float!, vehicleId: ID!): Parts!
  updateVehicle(id: ID!, name: String, manufacturer: String, year: Int): Vehicle!
  deletePart(id: ID!): Parts!
}
`
