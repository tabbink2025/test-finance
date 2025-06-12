import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Use the provided PostgreSQL credentials
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:test@localhost:5432/finance_tracker";

console.log("Connecting to database:", databaseUrl.replace(/\/\/.*@/, "//***@")); // Hide credentials in logs

const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

