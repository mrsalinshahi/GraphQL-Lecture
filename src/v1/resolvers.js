import { v4 as uuidv4 } from 'uuid';

// _id AS id bridges the DB column name to the GraphQL schema field.
// Quoted aliases ("firstName", "lastName") are required because pg lowercases
// unquoted identifiers, which would break the camelCase field mapping.
const SELECT_FIELDS = `_id AS id,
  firstName AS "firstName",
  lastName  AS "lastName",
  age, email, phone, address`;

const resolvers = {
  Query: {
    apiVersion: () => 'v1',

    people: async (_, { first = 20, offset = 0 }, { pool }) => {
      const [rows, count] = await Promise.all([
        pool.query(
          `SELECT ${SELECT_FIELDS} FROM people
           ORDER BY firstName, lastName
           LIMIT $1 OFFSET $2`,
          [first, offset]
        ),
        pool.query('SELECT COUNT(*) FROM people'),
      ]);
      return {
        nodes: rows.rows,
        totalCount: parseInt(count.rows[0].count, 10),
      };
    },

    person: async (_, { id }, { pool }) => {
      const result = await pool.query(
        `SELECT ${SELECT_FIELDS} FROM people WHERE _id = $1`,
        [id]
      );
      return result.rows[0] || null;
    },

    // Deprecated — delegates to people resolver without pagination
    getPerson: async (_, __, { pool }) => {
      const result = await pool.query(
        `SELECT ${SELECT_FIELDS} FROM people ORDER BY firstName, lastName`
      );
      return result.rows;
    },

    // Deprecated — delegates to person resolver
    getPersonById: async (_, { _id }, { pool }) => {
      const result = await pool.query(
        `SELECT ${SELECT_FIELDS} FROM people WHERE _id = $1`,
        [_id]
      );
      return result.rows[0] || null;
    },
  },

  Mutation: {
    addPerson: async (_, { input }, { pool }) => {
      const { firstName, lastName, age, email, phone, address } = input;
      const id = uuidv4();
      const result = await pool.query(
        `INSERT INTO people (_id, firstName, lastName, age, email, phone, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING ${SELECT_FIELDS}`,
        [id, firstName, lastName, age, email, phone, address]
      );
      return {
        success: true,
        message: 'Person created',
        person: result.rows[0],
      };
    },

    updatePerson: async (_, { id, input }, { pool }) => {
      const existing = await pool.query(
        `SELECT ${SELECT_FIELDS} FROM people WHERE _id = $1`,
        [id]
      );

      if (!existing.rows.length) {
        return { success: false, message: 'Person not found', person: null };
      }

      const cur = existing.rows[0];
      // Fetch-then-merge keeps the SQL static (no dynamic SET clauses).
      // ?? means null input values fall back to the current DB value —
      // callers cannot explicitly clear a field by passing null.
      const next = {
        firstName: input.firstName ?? cur.firstName,
        lastName: input.lastName ?? cur.lastName,
        age: input.age ?? cur.age,
        email: input.email ?? cur.email,
        phone: input.phone ?? cur.phone,
        address: input.address ?? cur.address,
      };

      const result = await pool.query(
        `UPDATE people
         SET firstName = $1, lastName = $2, age = $3,
             email = $4, phone = $5, address = $6
         WHERE _id = $7
         RETURNING ${SELECT_FIELDS}`,
        [
          next.firstName,
          next.lastName,
          next.age,
          next.email,
          next.phone,
          next.address,
          id,
        ]
      );
      return {
        success: true,
        message: 'Person updated',
        person: result.rows[0],
      };
    },

    deletePerson: async (_, { id }, { pool }) => {
      const result = await pool.query(
        `DELETE FROM people WHERE _id = $1
         RETURNING ${SELECT_FIELDS}`,
        [id]
      );

      if (!result.rows.length) {
        return { success: false, message: 'Person not found', person: null };
      }
      return {
        success: true,
        message: 'Person deleted',
        person: result.rows[0],
      };
    },
  },
};

export default resolvers;
