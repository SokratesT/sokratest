import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as auth from "./schema/auth";
import * as chat from "./schema/chat";
import * as chatMessage from "./schema/chat-message";
import * as chatMessageVote from "./schema/chat-message-vote";
import * as course from "./schema/course";
import * as document from "./schema/document";
import * as post from "./schema/post";

const pool = new Pool({
  connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT ?? 5432}/${process.env.POSTGRES_DB}`,
});

export const db = drizzle(pool, {
  schema: {
    auth,
    chatMessageVote,
    chatMessage,
    chat,
    course,
    document,
    post,
  },
});
