import { withAuthQuery } from "@/db/queries/utils/with-auth-query";
import type { PresignedUrlProp, ShortFileProp } from "@/lib/files/types";
import { createPresignedUrlToUpload } from "@/lib/s3/file-functions";
import { buckets } from "@/settings/buckets";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const POST = async (req: NextRequest) => {
  const filesMeta = (await req.json()) as ShortFileProp[];

  // TODO: Can probably be optimized
  const presignedUrls = [] as PresignedUrlProp[];

  const result = await withAuthQuery(
    async (session) => {
      await Promise.all(
        filesMeta.map(async (file) => {
          const id = uuidv4();

          const url = await createPresignedUrlToUpload({
            bucket: buckets.main.name,
            id,
            prefix: session.session.activeCourseId,
            type: file.type,
          });

          presignedUrls.push({
            id,
            url,
            name: file.name,
            size: file.size,
            type: file.type,
          });
        }),
      );
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

  return new NextResponse(JSON.stringify(presignedUrls));
};
