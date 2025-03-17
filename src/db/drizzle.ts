import { serverEnv } from "@/lib/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as auth from "./schema/auth";
import * as chat from "./schema/chat";
import * as chatMessage from "./schema/chat-message";
import * as chatMessageVote from "./schema/chat-message-vote";
import * as course from "./schema/course";
import * as document from "./schema/document";
import * as embedding from "./schema/embedding";
import * as post from "./schema/post";

const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    auth,
    chatMessageVote,
    chatMessage,
    chat,
    course,
    document,
    embedding,
    post,
  },
});
