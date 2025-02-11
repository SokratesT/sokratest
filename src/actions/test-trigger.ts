"use server";

import { db } from "@/db/drizzle";
import { files } from "@/db/schema/files";
import { getPresignedUrl } from "@/lib/files/uploadHelpers";
import type { helloWorldTask } from "@/trigger/example";
import { tasks } from "@trigger.dev/sdk/v3";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function enqueueEmbeddings(documentIds: string[]) {
  try {
    await db
      .update(files)
      .set({ embeddingStatus: "pending" })
      .where(inArray(files.id, documentIds));

    const docsWithUrls = await Promise.all(
      documentIds.map(async (documentId) => {
        const url = await getPresignedUrl(documentId);
        return { url, documentId };
      }),
    );

    const handle = await tasks.batchTrigger<typeof helloWorldTask>(
      "hello-world",
      docsWithUrls.map((doc) => ({
        payload: { url: doc.url, documentId: doc.documentId },
        options: {
          concurrencyKey: "TEST_CONCURRENCY_KEY",
          queue: {
            name: "my-task-queue",
            concurrencyLimit: 1,
          },
        },
      })),
    );

    revalidatePath("/app/repo");
  } catch (error) {
    console.error(error);
    return {
      error: "something went wrong",
    };
  }
}
