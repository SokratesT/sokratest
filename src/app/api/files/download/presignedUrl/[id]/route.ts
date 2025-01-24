import { db } from "@/db/drizzle";
import { files } from "@/db/schema/files";
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
    .select({ id: files.id, fileName: files.filename, bucket: files.bucket })
    .from(files)
    .where(eq(files.id, id));

  if (!fileObject) {
    return new NextResponse("Item not found", {
      status: 404,
    });
  }

  const presignedUrl = await createPresignedUrlToDownload({
    bucketName: fileObject.bucket,
    fileName: fileObject?.fileName,
  });

  console.log("Presigned URL: ", presignedUrl);

  return new NextResponse(JSON.stringify(presignedUrl), {
    status: 200,
  });
};
