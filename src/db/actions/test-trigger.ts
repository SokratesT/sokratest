"use server";

import { authActionClient, requireCourseMiddleware } from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";
import type { processDocumentTask } from "@/trigger/process-document-task";
import type { vectorizeFilesTask } from "@/trigger/vectorize-files-task";
import type { FilePayload } from "@/types/file";
import { tasks } from "@trigger.dev/sdk/v3";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../drizzle";
import { document } from "../schema/document";

export const enqueueDocuments = authActionClient
  .metadata({ actionName: "enqueueDocuments" })
  .schema(z.object({ ids: z.array(z.string()) }))
  .use(requireCourseMiddleware)
  .action(async ({ parsedInput: { ids }, ctx }) => {
    const docs = await db
      .select({
        id: document.id,
        bucket: document.bucket,
        type: document.fileType,
        prefix: document.prefix,
      })
      .from(document)
      .where(inArray(document.id, ids));

    const handle = await tasks.batchTrigger<typeof processDocumentTask>(
      "process-document-task",
      docs.map((doc) => ({
        payload: {
          courseId: ctx.activeCourseId,
          documentRef: doc as FilePayload,
        },
        /* options: {
          concurrencyKey: "TEST_CONCURRENCY_KEY",
          queue: {
            name: "my-task-queue",
            concurrencyLimit: 2,
          },
        }, */
      })),
    );

    revalidatePath(ROUTES.PRIVATE.documents.root.getPath());

    return { error: null };
  });

export const enqueueEmbeddings = authActionClient
  .metadata({ actionName: "enqueueEmbeddings" })
  .schema(z.object({ ids: z.array(z.string()) }))
  .use(requireCourseMiddleware)
  .action(async ({ parsedInput: { ids }, ctx }) => {
    const handle = await tasks.batchTrigger<typeof vectorizeFilesTask>(
      "vectorize-files-task",
      ids.map((id) => ({
        payload: { prefix: id, courseId: ctx.activeCourseId },
        /* options: {
          concurrencyKey: "TEST_CONCURRENCY_KEY",
          queue: {
            name: "my-task-queue",
            concurrencyLimit: 2,
          },
        }, */
      })),
    );

    revalidatePath(ROUTES.PRIVATE.documents.root.getPath());

    return { error: null };
  });
