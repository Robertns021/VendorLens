import "dotenv/config";

import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing. Check your backend/.env file."
  );
}

// Create a connection pool.
export const pool = new Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// Handle unexpected connection errors.
pool.on("error", (error) => {
  console.error(
    "Unexpected PostgreSQL connection error:",
    error.message
  );
});
