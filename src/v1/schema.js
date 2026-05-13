import { gql } from 'apollo-server-express';

const typeDefs = gql`
  # ─── Core Types ───────────────────────────────────────────────────────────────

  type Person {
    id: ID!
    firstName: String!
    lastName: String!
    age: Int
    email: String
    phone: String
    address: String
  }

  # Paginated list result
  type PersonsConnection {
    nodes: [Person!]!
    totalCount: Int!
  }

  # Mutation response envelope — every mutation returns success + optional person
  type PersonPayload {
    success: Boolean!
    message: String
    person: Person
  }

  # ─── Input Types ──────────────────────────────────────────────────────────────

  input AddPersonInput {
    firstName: String!
    lastName: String!
    age: Int
    email: String
    phone: String
    address: String
  }

  input UpdatePersonInput {
    firstName: String
    lastName: String
    age: Int
    email: String
    phone: String
    address: String
  }

  # ─── Queries ──────────────────────────────────────────────────────────────────

  type Query {
    apiVersion: String!

    # Paginated list. Defaults: first=20, offset=0
    people(first: Int, offset: Int): PersonsConnection!

    # Fetch a single person by ID
    person(id: ID!): Person

    # ── Deprecated v0 aliases (kept for backward compatibility) ──────────────
    getPerson: [Person!]!
      @deprecated(reason: "Use \`people\` with pagination instead")

    getPersonById(_id: ID!): Person
      @deprecated(reason: "Use \`person(id:)\` instead")
  }

  # ─── Mutations ────────────────────────────────────────────────────────────────

  type Mutation {
    addPerson(input: AddPersonInput!): PersonPayload!
    updatePerson(id: ID!, input: UpdatePersonInput!): PersonPayload!
    deletePerson(id: ID!): PersonPayload!
  }
`;

export default typeDefs;
