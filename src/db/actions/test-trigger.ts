"use server";

import { db } from "@/db/drizzle";
import { document } from "@/db/schema/document";
import {
  authActionClient,
  checkPermissionMiddleware,
  requireCourseMiddleware,
} from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";
import type { processDocumentTask } from "@/trigger/process-document-task";
import type { vectorizeFilesTask } from "@/trigger/vectorize-files-task";
import type { FilePayload } from "@/types/file";
import { tasks } from "@trigger.dev/sdk/v3";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const enqueueDocuments = authActionClient
  .metadata({
    actionName: "enqueueDocuments",
    permission: {
      resource: { context: "course", type: "document" },
      action: "update",
    },
  })
  .schema(z.object({ ids: z.array(z.string()) }))
  .use(requireCourseMiddleware)
  .use(checkPermissionMiddleware)
  .action(async ({ parsedInput: { ids }, ctx }) => {
    await db
      .update(document)
      .set({ status: "processing-document", updatedAt: new Date() })
      .where(inArray(document.id, ids));

    const docs = await db
      .select({
        id: document.id,
        bucket: document.bucket,
        type: document.fileType,
        prefix: document.prefix,
        metadata: document.metadata,
      })
      .from(document)
      .where(inArray(document.id, ids));

    const handle = await tasks.batchTrigger<typeof processDocumentTask>(
      "process-document-task",
      docs.map((doc) => ({
        payload: {
          courseId: ctx.activeCourseId,
          documentRef: doc as FilePayload,
          mergePages: doc.metadata.mergePages ?? true,
        },
        options: {
          concurrencyKey: "PROCESSING_DOCUMENT_CONCURRENCY_KEY",
          queue: {
            name: "processing-documents-queue",
            concurrencyLimit: 1,
          },
        },
      })),
    );

    revalidatePath(ROUTES.PRIVATE.documents.root.getPath());

    return { error: null };
  });

export const enqueueEmbeddings = authActionClient
  .metadata({
    actionName: "enqueueEmbeddings",
    permission: {
      resource: { context: "course", type: "document" },
      action: "delete",
    },
  })
  .schema(z.object({ ids: z.array(z.string()) }))
  .use(requireCourseMiddleware)
  .use(checkPermissionMiddleware)
  .action(async ({ parsedInput: { ids }, ctx }) => {
    await db
      .update(document)
      .set({ status: "generating-embedding", updatedAt: new Date() })
      .where(inArray(document.id, ids));

    const docs = await db
      .select({
        id: document.id,
        metadata: document.metadata,
      })
      .from(document)
      .where(inArray(document.id, ids));

    const handle = await tasks.batchTrigger<typeof vectorizeFilesTask>(
      "vectorize-files-task",
      docs.map((doc) => ({
        payload: {
          prefix: doc.id,
          courseId: ctx.activeCourseId,
          documentId: doc.id,
          mergePages: doc.metadata.mergePages ?? true,
        },
        options: {
          concurrencyKey: "GENERATING_EMBEDDING_CONCURRENCY_KEY",
          queue: {
            name: "processing-embeddings-queue",
            concurrencyLimit: 2,
          },
        },
      })),
    );

    revalidatePath(ROUTES.PRIVATE.documents.root.getPath());

    return { error: null };
  });
