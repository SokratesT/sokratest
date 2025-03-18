"use server";

import { db } from "@/db/drizzle";
import { document } from "@/db/schema/document";
import { getPresignedUrl } from "@/lib/files/uploadHelpers";
import { authActionClient } from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";
import type { helloWorldTask } from "@/trigger/example";
import { tasks } from "@trigger.dev/sdk/v3";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function enqueueEmbeddings2(fileIds: string[]) {
  try {
    await db
      .update(document)
      .set({ embeddingStatus: "processing" })
      .where(inArray(document.id, fileIds));

    const docsWithUrls = await Promise.all(
      fileIds.map(async (fileId) => {
        const url = await getPresignedUrl(fileId);
        return { url, fileId };
      }),
    );

    const handle = await tasks.batchTrigger<typeof helloWorldTask>(
      "hello-world",
      docsWithUrls.map((doc) => ({
        payload: { url: doc.url, documentId: doc.fileId },
        options: {
          concurrencyKey: "TEST_CONCURRENCY_KEY",
          queue: {
            name: "my-task-queue",
            concurrencyLimit: 1,
          },
        },
      })),
    );

    revalidatePath(ROUTES.PRIVATE.documents.root.getPath());
  } catch (error) {
    console.error(error);
    return {
      error: "something went wrong",
    };
  }
}

export const enqueueEmbeddings = authActionClient
  .metadata({ actionName: "enqueueEmbeddings" })
  .schema(z.object({ ids: z.array(z.string()) }))
  .action(async ({ parsedInput: { ids } }) => {
    await db
      .update(document)
      .set({ embeddingStatus: "processing" })
      .where(inArray(document.id, ids));

    const docsWithUrls = await Promise.all(
      ids.map(async (id) => {
        const url = await getPresignedUrl(id);
        return { url, id };
      }),
    );

    // Use this if frontend hooks for status are added
    /* const handle = await tasks.batchTrigger<typeof helloWorldTask>(
      "hello-world",
      docsWithUrls.map((doc) => ({
        payload: { url: doc.url, documentId: doc.fileId },
        options: {
          concurrencyKey: "TEST_CONCURRENCY_KEY",
          queue: {
            name: "my-task-queue",
            concurrencyLimit: 1,
          },
        },
      })),
    ); */

    revalidatePath(ROUTES.PRIVATE.documents.root.getPath());

    return { error: null };
  });
