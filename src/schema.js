import { gql } from 'apollo-server-express';

/**
 * GraphQL schema definition for the Person entity.
 *
 * This schema includes both query and mutation operations for full CRUD support.
 */
const typeDefs = gql`
  type Person {
    _id: ID!
    firstName: String!
    lastName: String!
    age: Int
    email: String
    phone: String
    address: String
  }

  type Query {
    getPerson: [Person!]!
    getPersonById(_id: ID!): Person
  }

  type Mutation {
    addPerson(
      firstName: String!
      lastName: String!
      age: Int
      email: String
      phone: String
      address: String
    ): Person!

    updatePerson(
      _id: ID!
      firstName: String
      lastName: String
      age: Int
      email: String
      phone: String
      address: String
    ): Person

    deletePerson(_id: ID!): Person
  }
`;

export default typeDefs;
