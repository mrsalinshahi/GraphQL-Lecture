import { v4 as uuidv4 } from 'uuid';
import { pool } from './db.js';

/**
 * GraphQL resolvers for the Person entity.
 *
 * Each resolver performs a single database operation and returns the
 * corresponding Person record or null when not found.
 */
const resolvers = {
  Query: {
    /**
     * Retrieve all people from the database.
     * The result is returned in alphabetical order by name.
     */
    getPerson: async () => {
      const result = await pool.query(
        `SELECT _id,
                firstName AS "firstName",
                lastName AS "lastName",
                age,
                email,
                phone,
                address
           FROM people
          ORDER BY firstName, lastName`
      );
      return result.rows;
    },

    /**
     * Retrieve a single person by primary key.
     *
     * @param {string} _id - The unique identifier of the person.
     */
    getPersonById: async (_, { _id }) => {
      const result = await pool.query(
        `SELECT _id,
                firstName AS "firstName",
                lastName AS "lastName",
                age,
                email,
                phone,
                address
           FROM people
          WHERE _id = $1`,
        [_id]
      );
      return result.rows[0] || null;
    }
  },

  Mutation: {
    /**
     * Insert a new person record and return the created entity.
     */
    addPerson: async (_, { firstName, lastName, age, email, phone, address }) => {
      const _id = uuidv4();
      const result = await pool.query(
        `INSERT INTO people (_id, firstName, lastName, age, email, phone, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING _id,
                   firstName AS "firstName",
                   lastName AS "lastName",
                   age,
                   email,
                   phone,
                   address`,
        [_id, firstName, lastName, age, email, phone, address]
      );
      return result.rows[0];
    },

    /**
     * Update an existing person record by ID.
     * Partial updates are supported.
     */
    updatePerson: async (_, { _id, firstName, lastName, age, email, phone, address }) => {
      const existing = await pool.query(
        `SELECT _id,
                firstName AS "firstName",
                lastName AS "lastName",
                age,
                email,
                phone,
                address
           FROM people
          WHERE _id = $1`,
        [_id]
      );

      if (!existing.rows.length) {
        return null;
      }

      const current = existing.rows[0];
      const updated = {
        firstName: firstName ?? current.firstName,
        lastName: lastName ?? current.lastName,
        age: age ?? current.age,
        email: email ?? current.email,
        phone: phone ?? current.phone,
        address: address ?? current.address
      };

      const result = await pool.query(
        `UPDATE people
         SET firstName = $1,
             lastName = $2,
             age = $3,
             email = $4,
             phone = $5,
             address = $6
         WHERE _id = $7
         RETURNING _id,
                   firstName AS "firstName",
                   lastName AS "lastName",
                   age,
                   email,
                   phone,
                   address`,
        [updated.firstName, updated.lastName, updated.age, updated.email, updated.phone, updated.address, _id]
      );

      return result.rows[0];
    },

    /**
     * Delete a person record by ID and return the deleted entity.
     */
    deletePerson: async (_, { _id }) => {
      const result = await pool.query(
        `DELETE FROM people
         WHERE _id = $1
         RETURNING _id,
                   firstName AS "firstName",
                   lastName AS "lastName",
                   age,
                   email,
                   phone,
                   address`,
        [_id]
      );
      return result.rows[0] || null;
    }
  }
};

export default resolvers;
