"use server";

import { db } from "@/db/drizzle";
import { fileRepository } from "@/db/schema/fileRepository";
import { getPresignedUrl } from "@/lib/files/uploadHelpers";
import type { helloWorldTask } from "@/trigger/example";
import { tasks } from "@trigger.dev/sdk/v3";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function enqueueEmbeddings(fileIds: string[]) {
  try {
    await db
      .update(fileRepository)
      .set({ embeddingStatus: "processing" })
      .where(inArray(fileRepository.id, fileIds));

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

    revalidatePath("/app/repo");
  } catch (error) {
    console.error(error);
    return {
      error: "something went wrong",
    };
  }
}
