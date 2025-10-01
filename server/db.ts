import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Allow running without database in development mode
const isDevelopment = process.env.NODE_ENV === 'development';
const hasDatabase = !!process.env.DATABASE_URL;

if (!hasDatabase && !isDevelopment) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Only initialize database if DATABASE_URL is provided
let pool: Pool | null = null;
let db: any = null;

if (hasDatabase) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else if (isDevelopment) {
  console.log('⚠️  Running without database - using mock storage');
}

export { pool, db };
