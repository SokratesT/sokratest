"use server";

import { db } from "@/db/drizzle";
import { files } from "@/db/schema/files";
import { PresignedUrlProp } from "@/lib/files/types";
import { revalidatePath } from "next/cache";

export const saveFileInfoInDB = async (
  filesInfo: PresignedUrlProp[],
  bucket: string,
  fileType: string,
) => {
  console.log(JSON.stringify(filesInfo));

  await db.insert(files).values(
    filesInfo.map((file) => ({
      id: file.id,
      bucket,
      filename: file.id,
      originalName: file.originalFileName,
      size: file.fileSize,
      fileType,
    })),
  );

  revalidatePath("/app/up");
};
