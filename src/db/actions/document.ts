"use server";

import { db } from "@/db/drizzle";
import { document } from "@/db/schema/document";
import { fileDeleteSchema, fileInsertSchema } from "@/db/zod/document";
import { deleteFileFromBucket } from "@/lib/s3/file-functions";
import {
  authActionClient,
  checkPermissionMiddleware,
  requireCourseMiddleware,
  requireOrganizationMiddleware,
} from "@/lib/safe-action";
import { buckets } from "@/settings/buckets";
import { ROUTES } from "@/settings/routes";
import type { FileType } from "@/types/file";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const saveDocumentInfo = authActionClient
  .metadata({
    actionName: "saveDocumentInfo",
    permission: {
      resource: { context: "course", type: "document" },
      action: "create",
    },
  })
  .use(requireCourseMiddleware)
  .use(requireOrganizationMiddleware)
  .use(checkPermissionMiddleware)
  .schema(fileInsertSchema)
  .action(
    async ({
      parsedInput: { id, title, size, fileType },
      ctx: { userId, activeCourseId },
    }) => {
      await db.insert(document).values({
        id,
        courseId: activeCourseId,
        bucket: buckets.main.name,
        prefix: activeCourseId,
        title,
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
  .metadata({
    actionName: "deleteDocumentInfo",
    permission: {
      resource: { context: "course", type: "document" },
      action: "delete",
    },
  })
  .schema(fileDeleteSchema)
  .use(checkPermissionMiddleware)
  .action(async ({ parsedInput: { refs } }) => {
    const ids = refs.map((ref) => ref.id);

    const filesToDelete = await db
      .select()
      .from(document)
      .where(inArray(document.id, ids));

    Promise.all(
      filesToDelete.map(async (file) => {
        await deleteFileFromBucket({
          bucket: file.bucket,
          id: file.id,
          prefix: file.prefix,
          type: file.fileType as FileType,
        });
      }),
    );

    await db.delete(document).where(inArray(document.id, ids));

    revalidatePath(ROUTES.PRIVATE.documents.root.getPath());
    return { error: null };
  });
