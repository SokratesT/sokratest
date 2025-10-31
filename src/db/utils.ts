import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from "drizzle-orm";
import type * as Auth from "./schema/auth";
import type * as Chat from "./schema/chat";
import type * as ChatMessage from "./schema/chat-message";
import type * as Course from "./schema/course";
import type * as Document from "./schema/document";

type Schema = typeof Auth &
  typeof ChatMessage &
  typeof Chat &
  typeof Course &
  typeof Document;
type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
  "one" | "many",
  boolean,
  TSchema,
  TSchema[TableName]
>["with"];

export type InferResultType<
  TableName extends keyof TSchema,
  With extends IncludeRelation<TableName> | undefined = undefined,
> = BuildQueryResult<
  TSchema,
  TSchema[TableName],
  {
    with: With;
  }
>;
