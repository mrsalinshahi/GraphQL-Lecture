import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

/**
 * PostgreSQL connection pool.
 *
 * The pool is configured from environment variables and shared across
 * the resolver functions for efficient connection reuse.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE || 'graphql_db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres'
});

/**
 * Ensure the required database schema exists before the application starts.
 *
 * This function is idempotent and can safely be called on every startup.
 */
async function setupDatabase() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS people (
      _id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      age INTEGER,
      email TEXT,
      phone TEXT,
      address TEXT
    );
  `;

  await pool.query(createTableSql);
}

export { pool, setupDatabase };
