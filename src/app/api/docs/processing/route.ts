import { db } from "@/db/drizzle";
import type { Course } from "@/db/schema/course";
import { type Document, document } from "@/db/schema/document";
import type { vectorizeFilesTask } from "@/trigger/vectorize-files-task";
import { tasks } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

// Base type with common properties
interface ProcessingStatusBase {
  documentId: Document["id"];
  courseId: Course["id"];
  step: "processing" | "embedding";
}

// Success variant
interface ProcessingStatusSuccess extends ProcessingStatusBase {
  status: "success";
}

// Error variant with required error property
interface ProcessingStatusError extends ProcessingStatusBase {
  status: "error";
  error: string;
}

// Discriminated union
export type ProcessingStatus = ProcessingStatusSuccess | ProcessingStatusError;

export const POST = async (req: NextRequest) => {
  const processingStatus = (await req.json()) as ProcessingStatus;

  if (
    processingStatus.step === "processing" &&
    processingStatus.status === "success"
  ) {
    await db
      .update(document)
      .set({ status: "generating-embedding", updatedAt: new Date() })
      .where(eq(document.id, processingStatus.documentId));

    await tasks.trigger<typeof vectorizeFilesTask>("vectorize-files-task", {
      prefix: processingStatus.documentId,
      courseId: processingStatus.courseId,
      documentId: processingStatus.documentId,
    });

    // Trigger embedding task
    return new NextResponse("Success", {
      status: 200,
    });
  } else if (
    processingStatus.step === "embedding" &&
    processingStatus.status === "success"
  ) {
    await db
      .update(document)
      .set({ status: "ready", updatedAt: new Date() })
      .where(eq(document.id, processingStatus.documentId));

    return new NextResponse("Success", {
      status: 200,
    });
  }

  await db
    .update(document)
    .set({ status: "failed", updatedAt: new Date() })
    .where(eq(document.id, processingStatus.documentId));

  return new NextResponse("Error", {
    status: 500,
  });
};
