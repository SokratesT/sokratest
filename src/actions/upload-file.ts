"use server";

import { db } from "@/db/drizzle";
import { files } from "@/db/schema/files";
import { auth } from "@/lib/auth";
import type { PresignedUrlProp } from "@/lib/files/types";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const saveFileInfoInDB = async (
  filesInfo: PresignedUrlProp[],
  bucket: string,
  fileType: string,
) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    throw new Error("Not authenticated");
  }

  await db.insert(files).values(
    filesInfo.map((file) => ({
      id: file.id,
      bucket,
      title: file.originalFileName,
      filename: file.id,
      originalName: file.originalFileName,
      size: file.fileSize,
      userId: session?.user.id,
      fileType,
    })),
  );

  revalidatePath("/app/up");
};
