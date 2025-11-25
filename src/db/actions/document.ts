"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { document } from "@/db/schema/document";
import {
  documentDeleteSchema,
  documentInsertSchema,
  documentUpdateSchema,
} from "@/db/zod/document";
import {
  deleteFileFromBucket,
  deletePrefixRecursively,
} from "@/lib/s3/file-functions";
import {
  authActionClient,
  checkPermissionMiddleware,
  requireCourseMiddleware,
  requireOrganizationMiddleware,
} from "@/lib/safe-action";
import { deleteChunksByDocumentId } from "@/qdrant/mutations";
import { buckets } from "@/settings/buckets";
import { ROUTES } from "@/settings/routes";
import type { FileType } from "@/types/file";

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
  .schema(documentInsertSchema)
  .action(
    async ({
      parsedInput: { id, title, size, fileType, metadata },
      ctx: { userId, activeCourseId },
    }) => {
      await db.insert(document).values({
        id,
        courseId: activeCourseId,
        bucket: buckets.main.name,
        prefix: activeCourseId,
        title,
        metadata,
        size,
        fileType: fileType as FileType,
        uploadedBy: userId,
      });

      revalidatePath(ROUTES.PRIVATE.documents.root.getPath());

      return { error: null };
    },
  );

export const updateDocument = authActionClient
  .metadata({
    actionName: "updateDocument",
    permission: {
      resource: { context: "course", type: "document" },
      action: "update",
    },
  })
  .use(checkPermissionMiddleware)
  .schema(documentUpdateSchema)
  .action(async ({ parsedInput: { id, title, metadata } }) => {
    await db
      .update(document)
      .set({ title, metadata, updatedAt: new Date() })
      .where(eq(document.id, id));

    revalidatePath(ROUTES.PRIVATE.documents.root.getPath());
    return { error: null };
  });

// TODO: This function should get the prefix instead of looking up files
export const deleteDocumentInfo = authActionClient
  .metadata({
    actionName: "deleteDocumentInfo",
    permission: {
      resource: { context: "course", type: "document" },
      action: "delete",
    },
  })
  .schema(documentDeleteSchema)
  .use(checkPermissionMiddleware)
  .action(async ({ parsedInput: { refs } }) => {
    const ids = refs.map((ref) => ref.id);

    const filesToDelete = await db
      .select()
      .from(document)
      .where(inArray(document.id, ids));

    await Promise.all(
      filesToDelete.map(async (file) => {
        await deleteFileFromBucket({
          bucket: file.bucket,
          id: file.id,
          prefix: file.prefix,
          type: file.fileType as FileType,
        });
        await deleteChunksByDocumentId({
          courseId: file.courseId,
          documentId: file.id,
        });
        await deletePrefixRecursively({
          bucket: buckets.processed.name,
          prefix: `${file.id}/`,
        });
      }),
    );

    await db.delete(document).where(inArray(document.id, ids));

    revalidatePath(ROUTES.PRIVATE.documents.root.getPath());
    return { error: null };
  });
