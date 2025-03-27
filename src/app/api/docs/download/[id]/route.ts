import { db } from "@/db/drizzle";
import { withAuthQuery } from "@/db/queries/utils/with-auth-query";
import { type Document, document } from "@/db/schema/document";
import { createPresignedUrlToDownload } from "@/lib/s3/file-functions";
import type { FileType } from "@/types/file";
import { eq, and } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: Document["id"] }> },
) => {
  const { id } = await params;

  const result = await withAuthQuery(
    async (session) => {
      const [fileReference] = await db
        .select({
          id: document.id,
          bucket: document.bucket,
          type: document.fileType,
        })
        .from(document)
        .where(
          and(
            eq(document.id, id),
            eq(document.courseId, session.session.activeCourseId),
          ),
        );

      const presignedUrl = createPresignedUrlToDownload({
        bucket: fileReference.bucket,
        id: fileReference?.id,
        prefix: session.session.activeCourseId,
        type: fileReference.type as FileType,
      });

      return { presignedUrl };
    },
    { requireCourse: true },
  );

  if (!result.success) {
    if (result.error.code === "NOT_AUTHENTICATED") {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    if (result.error.code === "NO_ACTIVE_COURSE") {
      return new NextResponse("No active course", {
        status: 403,
      });
    }

    if (result.error.code === "QUERY_EXECUTION_ERROR") {
      return new NextResponse(result.error.message, {
        status: 500,
      });
    }
    return new NextResponse("Unknown error", {
      status: 500,
    });
  }

  return new NextResponse(JSON.stringify(await result.data.presignedUrl), {
    status: 200,
  });
};
