import { Placeholder } from "@/components/placeholders/placeholder";
import type { Document } from "@/db/schema/document";
import { getChunksByDocument } from "@/qdrant/queries";
import { DisplayChunk } from "./_components/display-chunk";

const EditPostPage = async ({
  params,
}: {
  params: Promise<{ id: Document["id"] }>;
}) => {
  const { id } = await params;

  const result = await getChunksByDocument({ documentId: id });

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  const chunks = result.data.query.points;

  return (
    <div className="grid grid-cols-1 gap-2">
      {chunks.map((chunk) => (
        <DisplayChunk key={chunk.id} chunk={chunk} />
      ))}
    </div>
  );
};

export default EditPostPage;
