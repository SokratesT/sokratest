import { defineConfig } from "drizzle-kit";
import { serverEnv } from "./src/lib/env/server";

export default defineConfig({
  schema: "./src/db/schema",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
});
