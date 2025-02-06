"use server";

import { db } from "@/db/drizzle";
import { type File, files } from "@/db/schema/files";
import { auth } from "@/lib/auth";
import { deleteFileFromBucket } from "@/lib/s3-file-management";
import { routes } from "@/settings/routes";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// TODO: This function should get the bucket instead of looking up files
export const deleteFileInfoFromDB = async (fileIds: File["id"][]) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  const filesToDelete = await db
    .select()
    .from(files)
    .where(inArray(files.id, fileIds));

  Promise.all(
    filesToDelete.map(async (file) => {
      await deleteFileFromBucket({
        bucketName: file.bucket,
        fileName: file.filename,
      });
    }),
  );

  await db.delete(files).where(inArray(files.id, fileIds));

  revalidatePath(routes.app.sub.up.path);
};
