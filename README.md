# GraphQL CRUD Application with PostgreSQL

A versioned GraphQL CRUD API for managing `Person` records, built with Express, Apollo Server, and PostgreSQL.

## Project structure

```
main.js                  — root launcher
src/
  server.js              — Express/Apollo setup, CORS, health check
  db.js                  — PostgreSQL connection pool and schema init
  v1/
    schema.js            — GraphQL type definitions (v1)
    resolvers.js         — query and mutation resolvers (v1)
```

## Prerequisites

- Node.js 18+
- PostgreSQL instance accessible from this machine (or Docker)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```bash
cp .env.example .env
```

3. Fill in your PostgreSQL connection values in `.env`.

4. Start PostgreSQL (Docker example):

```bash
docker run --name my-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=graphql_db \
  -p 5432:5432 -d postgres
```

## Run the server

```bash
npm start
```

| Endpoint                                    | Description             |
| ------------------------------------------- | ----------------------- |
| `POST http://localhost:4000/api/v1/graphql` | GraphQL API             |
| `GET  http://localhost:4000/health`         | Health check (pings DB) |

## GraphQL API — v1

### Queries

| Operation                         | Description                    |
| --------------------------------- | ------------------------------ |
| `apiVersion`                      | Returns `"v1"`                 |
| `people(first: Int, offset: Int)` | Paginated list of people       |
| `person(id: ID!)`                 | Fetch a single person by ID    |
| ~~`getPerson`~~                   | Deprecated — use `people`      |
| ~~`getPersonById(_id: ID!)`~~     | Deprecated — use `person(id:)` |

### Mutations

All mutations return a `PersonPayload`:

```graphql
type PersonPayload {
  success: Boolean!
  message: String
  person: Person
}
```

| Operation                                          | Description         |
| -------------------------------------------------- | ------------------- |
| `addPerson(input: AddPersonInput!)`                | Create a new person |
| `updatePerson(id: ID!, input: UpdatePersonInput!)` | Partial update      |
| `deletePerson(id: ID!)`                            | Remove a person     |

## Example requests

Use `POST http://localhost:4000/api/v1/graphql` with `Content-Type: application/json`.

### List people (paginated)

```json
{
  "query": "query { people(first: 10, offset: 0) { totalCount nodes { id firstName lastName email } } }"
}
```

### Add a person

```json
{
  "query": "mutation AddPerson($input: AddPersonInput!) { addPerson(input: $input) { success message person { id firstName lastName } } }",
  "variables": {
    "input": {
      "firstName": "Jane",
      "lastName": "Doe",
      "age": 28,
      "email": "jane.doe@example.com",
      "phone": "555-0101",
      "address": "123 Main Street"
    }
  }
}
```

### Update a person

```json
{
  "query": "mutation UpdatePerson($id: ID!, $input: UpdatePersonInput!) { updatePerson(id: $id, input: $input) { success message person { id firstName lastName age } } }",
  "variables": {
    "id": "your-person-id",
    "input": { "age": 29 }
  }
}
```

### Delete a person

```json
{
  "query": "mutation DeletePerson($id: ID!) { deletePerson(id: $id) { success message person { id firstName lastName } } }",
  "variables": { "id": "your-person-id" }
}
```

### Health check

```bash
curl http://localhost:4000/health
# { "status": "ok", "version": "v1", "timestamp": "..." }
```

## Notes

- The `people` table is created automatically on startup if it does not exist.
- Introspection is disabled when `NODE_ENV=production`.
- Error responses omit internal stack details in production.
- To add a v2 API, create `src/v2/schema.js` and `src/v2/resolvers.js`, then mount a second Apollo instance at `/api/v2/graphql` in `server.js`.
