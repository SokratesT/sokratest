"use server";

import { db } from "@/db/drizzle";
import { fileRepository } from "@/db/schema/file-repository";
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

  if (!session.session.activeCourseId) {
    throw new Error("No active course");
  }

  const courseId = session.session.activeCourseId;

  await db.insert(fileRepository).values(
    filesInfo.map((file) => ({
      id: file.id,
      bucket,
      prefix: "", // TODO: Implement prefix handling
      filename: file.id,
      originalName: file.originalFileName,
      courseId,
      size: file.fileSize,
      uploadedBy: session?.user.id,
      fileType,
    })),
  );

  revalidatePath("/app/up");
};
