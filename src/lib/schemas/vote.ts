import { votes } from "@/db/schema/votes";
import { createInsertSchema } from "drizzle-zod";

export const voteInsertSchema = createInsertSchema(votes);
