import { Placeholder } from "@/components/ui/custom/placeholder";
import { querySearchParamsCache } from "@/lib/nuqs/search-params.search";
import type { SearchParams } from "nuqs/server";
import { QdrantPlaygroundForm } from "./_components/qdrant-playground-form";
import QdrantPlaygroundResults from "./_components/qdrant-playground-results";

const QdrantPlaygroundPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { search } = await querySearchParamsCache.parse(searchParams);

  return (
    <div className="flex flex-col gap-8">
      <QdrantPlaygroundForm />
      {search ? (
        <QdrantPlaygroundResults search={search} />
      ) : (
        <Placeholder>Search for chunks</Placeholder>
      )}
    </div>
  );
};

export default QdrantPlaygroundPage;
