// src/db/drizzle.ts
import { files } from "@/db/schema/files";
import { serverEnv } from "@/lib/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    files,
  },
});
