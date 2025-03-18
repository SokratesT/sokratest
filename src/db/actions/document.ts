"use server";

import { db } from "@/db/drizzle";
import { document } from "@/db/schema/document";
import { fileDeleteSchema, fileInsertSchema } from "@/db/zod/document";
import { deleteFileFromBucket } from "@/lib/s3-file-management";
import {
  authActionClient,
  requireCourseMiddleware,
  requireOrganizationMiddleware,
} from "@/lib/safe-action";
import { ROUTES } from "@/settings/routes";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const saveDocumentInfo = authActionClient
  .metadata({ actionName: "saveDocumentInfo" })
  .use(requireCourseMiddleware)
  .use(requireOrganizationMiddleware)
  .schema(fileInsertSchema)
  .action(
    async ({
      parsedInput: { bucket, filename, size, fileType },
      ctx: { userId, activeCourseId },
    }) => {
      await db.insert(document).values({
        courseId: activeCourseId,
        bucket,
        prefix: activeCourseId,
        filename,
        size,
        fileType,
        uploadedBy: userId,
      });

      revalidatePath(ROUTES.PRIVATE.documents.root.getPath());

      return { error: null };
    },
  );

// TODO: This function should get the prefix instead of looking up files
export const deleteDocumentInfo = authActionClient
  .metadata({ actionName: "deleteDocumentInfo" })
  .schema(fileDeleteSchema)
  .action(async ({ parsedInput: { ids } }) => {
    const filesToDelete = await db
      .select()
      .from(document)
      .where(inArray(document.id, ids));

    Promise.all(
      filesToDelete.map(async (file) => {
        await deleteFileFromBucket({
          bucketName: file.bucket,
          fileName: file.filename,
        });
      }),
    );

    await db.delete(document).where(inArray(document.id, ids));

    revalidatePath(ROUTES.PRIVATE.documents.root.getPath());
    return { error: null };
  });
