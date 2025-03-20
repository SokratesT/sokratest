import { db } from "@/db/drizzle";
import { document } from "@/db/schema/document";
import { createPresignedUrlToDownload } from "@/lib/s3-file-management";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  if (!id) {
    return new NextResponse("Invalid request", {
      status: 400,
    });
  }

  // Get the file name in bucket from the database
  const [fileObject] = await db
    .select({
      id: document.id,
      bucket: document.bucket,
    })
    .from(document)
    .where(eq(document.id, id));

  if (!fileObject) {
    return new NextResponse("Item not found", {
      status: 404,
    });
  }

  const presignedUrl = await createPresignedUrlToDownload({
    bucketName: fileObject.bucket,
    fileName: fileObject?.id,
  });

  return new NextResponse(JSON.stringify(presignedUrl), {
    status: 200,
  });
};
