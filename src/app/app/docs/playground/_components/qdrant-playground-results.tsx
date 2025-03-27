import { Markdown } from "@/components/chat/markdown";
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

  const points = result.data.query.points;

  return (
    <div className="flex flex-col gap-4">
      {points.map((point) => (
        <div key={point.id} className="rounded-2xl border bg-card p-4">
          <h3 className="font-semibold text-lg">{point.id}</h3>
          <p className="text-muted-foreground text-sm">
            {point.score.toFixed(2)}
          </p>
          <Markdown>{point.payload.text as string}</Markdown>
        </div>
      ))}
    </div>
  );
};

export default QdrantPlaygroundResults;
