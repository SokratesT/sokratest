import { Placeholder } from "@/components/placeholders/placeholder";
import { getChunks } from "@/qdrant/queries";
import { DisplayChunk } from "@/app/app/docs/view/[id]/chunks/_components/display-chunk";

const QdrantPlaygroundResults = async ({
  search,
}: {
  search: string;
}) => {
  const result = await getChunks({ search });

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  const points = result.data.query.points;

  return (
    <div className="flex flex-col gap-4">
      {points.map((point) => (
        <DisplayChunk key={point.id} chunk={point} />
      ))}
    </div>
  );
};

export default QdrantPlaygroundResults;
