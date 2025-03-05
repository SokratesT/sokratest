"use server";

import { db } from "@/db/drizzle";
import { fileRepository } from "@/db/schema/file-repository";
import { deleteFileFromBucket } from "@/lib/s3-file-management";
import {
  authActionClient,
  requireCourseMiddleware,
  requireOrganizationMiddleware,
} from "@/lib/safe-action";
import { fileDeleteSchema, fileInsertSchema } from "@/lib/schemas/file-upload";
import { routes } from "@/settings/routes";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const saveFileInfo = authActionClient
  .metadata({ actionName: "saveFileInfo" })
  .use(requireCourseMiddleware)
  .use(requireOrganizationMiddleware)
  .schema(fileInsertSchema)
  .action(
    async ({
      parsedInput: { bucket, filename, size, fileType },
      ctx: { userId, activeCourseId },
    }) => {
      await db.insert(fileRepository).values({
        courseId: activeCourseId,
        bucket,
        prefix: activeCourseId,
        filename,
        size,
        fileType,
        uploadedBy: userId,
      });

      revalidatePath(routes.app.sub.up.path);

      return { error: null };
    },
  );

// TODO: This function should get the prefix instead of looking up files
export const deleteFileInfo = authActionClient
  .metadata({ actionName: "deleteFileInfo" })
  .schema(fileDeleteSchema)
  .action(async ({ parsedInput: { ids } }) => {
    const filesToDelete = await db
      .select()
      .from(fileRepository)
      .where(inArray(fileRepository.id, ids));

    Promise.all(
      filesToDelete.map(async (file) => {
        await deleteFileFromBucket({
          bucketName: file.bucket,
          fileName: file.filename,
        });
      }),
    );

    await db.delete(fileRepository).where(inArray(fileRepository.id, ids));

    revalidatePath(routes.app.sub.up.path);
    return { error: null };
  });
