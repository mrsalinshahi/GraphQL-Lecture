import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

// When DATABASE_URL is set it takes full precedence; pg ignores the individual
// host/port/user/password fields if connectionString is provided.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE || 'graphql_db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
});

// Runs CREATE TABLE IF NOT EXISTS on every startup — safe to call repeatedly.
async function setupDatabase() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS people (
      _id TEXT PRIMARY KEY,  -- named _id (not id) to avoid the SQL reserved word; aliased to "id" in all SELECT queries
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
