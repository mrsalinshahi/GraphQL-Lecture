# GraphQL CRUD Application with PostgreSQL

This repository implements a GraphQL CRUD API for managing `Person` records. The application is split into modular files for database access, schema definition, resolver logic, and server setup.

## Project structure

- `main.js` — root launcher, starts the GraphQL server
- `src/db.js` — PostgreSQL connection setup and schema initialization
- `src/schema.js` — GraphQL type definitions and API schema
- `src/resolvers.js` — query and mutation resolver implementations
- `src/server.js` — Express/Apollo Server configuration and HTTP endpoints
- `.env.example` — database connection environment variables template

## Prerequisites

- Node.js 18+ or compatible runtime
- PostgreSQL instance accessible from this machine
- Docker is optional, but supported for running PostgreSQL in a container

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from the example:

```bash
cp .env.example .env
```

3. Configure your PostgreSQL connection values in `.env`.

4. Ensure the database is available. With Docker, one example command is:

```bash
docker run --name my-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=graphql_db -p 5432:5432 -d postgres
```

## Run the server

```bash
npm start
```

Once the server is running, the GraphQL endpoint will be available at:

```
http://localhost:4000/graphql
```

## GraphQL API

### Queries

- `getPerson` — fetch all people
- `getPersonById(_id: ID!)` — fetch a person by ID

### Mutations

- `addPerson(firstName, lastName, age, email, phone, address)` — create a new person
- `updatePerson(_id, ...)` — update an existing person
- `deletePerson(_id)` — remove a person

## Example Postman request

Use `POST http://localhost:4000/graphql` with the header `Content-Type: application/json`.

### Add a person

```json
{
  "query": "mutation AddPerson($firstName: String!, $lastName: String!, $age: Int, $email: String, $phone: String, $address: String) { addPerson(firstName: $firstName, lastName: $lastName, age: $age, email: $email, phone: $phone, address: $address) { _id firstName lastName age email phone address } }",
  "variables": {
    "firstName": "Jane",
    "lastName": "Doe",
    "age": 28,
    "email": "jane.doe@example.com",
    "phone": "555-0101",
    "address": "123 Main Street"
  }
}
```

## Notes

- The database table is created automatically on startup if it does not already exist.
- The code is intentionally modular so each layer can be extended or tested independently.
- The GET `/graphql` handler supports simple GraphQL query execution via query string parameters.
