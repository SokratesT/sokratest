import { serverEnv } from "@/lib/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as auth from "./schema/auth";
import * as chat from "./schema/chat";
import * as courses from "./schema/courses";
import * as embeddings from "./schema/embeddings";
import * as fileRepository from "./schema/file-repository";
import * as posts from "./schema/posts";

const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    auth,
    courses,
    embeddings,
    chat,
    fileRepository,
    posts,
  },
});
