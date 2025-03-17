import type { PresignedUrlProp, ShortFileProp } from "@/lib/files/types";
import { createPresignedUrlToUpload } from "@/lib/s3-file-management";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const files = (await req.json()) as ShortFileProp[];

  const presignedUrls = [] as PresignedUrlProp[];

  if (files?.length) {
    // use Promise.all to get all the presigned urls in parallel
    await Promise.all(
      // loop through the files
      files.map(async (file) => {
        // get presigned url using s3 sdk
        const url = await createPresignedUrlToUpload({
          bucketName: file.bucketName,
          fileName: file.id,
          expiry: 60 * 60, // 24 hours
        });

        // add presigned url to the list
        presignedUrls.push({
          id: file.id,
          originalFileName: file.originalFileName,
          fileSize: file.fileSize,
          url,
        });
      }),
    );
  }

  return new NextResponse(JSON.stringify(presignedUrls));
};
