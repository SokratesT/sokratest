import { FileViewer } from "@/components/documents/file-viewer";
import { db } from "@/db/drizzle";
import { type Document, document } from "@/db/schema/document";
import { eq } from "drizzle-orm";

const EditFilePage = async ({
  params,
}: {
  params: Promise<{ id: Document["id"] }>;
}) => {
  const { id } = await params;

  const [queryFile] = await db
    .select()
    .from(document)
    .where(eq(document.id, id));

  return <FileViewer fileInfo={queryFile} />;
};

export default EditFilePage;
