import { Placeholder } from "@/components/placeholders/placeholder";
import { getDocumentById } from "@/db/queries/document";
import type { Document } from "@/db/schema/document";
import { DocumentForm } from "../../_components/document-form";

const ViewDocumentPage = async ({
  params,
}: {
  params: Promise<{ id: Document["id"] }>;
}) => {
  const { id } = await params;

  const result = await getDocumentById(id);

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  if (!result.data.query) {
    return <Placeholder>No such document</Placeholder>;
  }

  return <DocumentForm document={result.data.query} />;
};

export default ViewDocumentPage;
