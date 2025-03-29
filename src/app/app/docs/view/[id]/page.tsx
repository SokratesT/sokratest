import { FileViewer } from "@/components/documents/file-viewer";
import { getDocumentById } from "@/db/queries/document";
import type { Document } from "@/db/schema/document";

const ViewDocumentPage = async ({
  params,
}: {
  params: Promise<{ id: Document["id"] }>;
}) => {
  const { id } = await params;

  const result = await getDocumentById(id);

  if (!result.success) {
    return <div>{result.error.message}</div>;
  }

  if (!result.data.query) {
    return <div>No such document</div>;
  }

  return <FileViewer document={result.data.query} />;
};

export default ViewDocumentPage;
