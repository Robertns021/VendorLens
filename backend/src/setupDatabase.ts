import "dotenv/config";
import { readFile } from "node:fs/promises";
import { pool } from "./db.js";

async function setupDatabase() {
  try {
    // Read the SQL schema from the backend/sql folder.
    const schema = await readFile(
      new URL("../sql/schema.sql", import.meta.url),
      "utf8"
    );

    // Execute the schema against PostgreSQL.
    await pool.query(schema);

    console.log("Database schema created successfully!");
  } catch (error) {
    console.error(
      "Database setup failed:",
      error instanceof Error ? error.message : error
    );

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void setupDatabase();
