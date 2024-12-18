"use server";

import { db } from "@/db/drizzle";
import { files } from "@/db/schema/files";
import { deleteFileFromBucket } from "@/lib/s3-file-management";
import { routes } from "@/settings/routes";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const deleteFileInfoFromDB = async (
  filesInfo: (typeof files.$inferSelect)[],
) => {
  await db.delete(files).where(
    inArray(
      files.filename,
      filesInfo.map((file) => file.filename),
    ),
  );

  Promise.all(
    filesInfo.map(async (file) => {
      await deleteFileFromBucket({
        bucketName: file.bucket,
        fileName: file.filename,
      });
    }),
  );

  revalidatePath(routes.app.sub.up.path);
};
