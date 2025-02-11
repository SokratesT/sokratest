import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from "drizzle-orm";
import type * as auth from "./schema/auth";
import type * as chat from "./schema/chat";
import type * as courses from "./schema/courses";
import type * as embeddings from "./schema/embeddings";
import type * as fileRepository from "./schema/fileRepository";
import type * as posts from "./schema/posts";

type Schema = typeof auth &
  typeof chat &
  typeof courses &
  typeof embeddings &
  typeof fileRepository &
  typeof posts;
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
