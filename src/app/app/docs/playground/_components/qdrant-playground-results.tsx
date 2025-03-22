import { Placeholder } from "@/components/ui/custom/placeholder";
import { getChunks } from "@/qdrant/queries";

const QdrantPlaygroundResults = async ({
  search,
}: {
  search: string;
}) => {
  const result = await getChunks({ search });

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  return (
    <div>
      {(await result.data.query).points.map((point) => (
        <div key={point.id} className="border-b p-4">
          <h3 className="font-semibold text-lg">{point.id}</h3>
          {point.payload && <p>{point.payload.text as string}</p>}
        </div>
      ))}
    </div>
  );
};

export default QdrantPlaygroundResults;
