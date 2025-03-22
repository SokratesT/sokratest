"use server";
import { getPresignedUrl } from "@/lib/files/uploadHelpers";
import { authActionClient } from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";
import type { testTask } from "@/trigger/test";
import { tasks } from "@trigger.dev/sdk/v3";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const enqueueEmbeddings = authActionClient
  .metadata({ actionName: "enqueueEmbeddings" })
  .schema(z.object({ ids: z.array(z.string()), courseId: z.string() }))
  .action(async ({ parsedInput: { ids, courseId } }) => {
    /* await db
      .update(document)
      .set({ embeddingStatus: "processing" })
      .where(inArray(document.id, ids)); */

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

    const handle = await tasks.batchTrigger<typeof testTask>(
      "test-task",
      docsWithUrls.map((doc) => ({
        payload: { url: doc.url, documentId: doc.id, courseId },
        /* options: {
          concurrencyKey: "TEST_CONCURRENCY_KEY",
          queue: {
            name: "my-task-queue",
            concurrencyLimit: 2,
          },
        }, */
      })),
    );

    console.log("Handle", handle);

    revalidatePath(ROUTES.PRIVATE.documents.root.getPath());

    return { error: null };
  });
