import { Placeholder } from "@/components/placeholders/placeholder";
import { querySearchParamsCache } from "@/lib/nuqs/search-params.search";
import type { SearchParams } from "nuqs/server";
import { QdrantPlaygroundForm } from "./_components/qdrant-playground-form";
import QdrantPlaygroundResults from "./_components/qdrant-playground-results";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { ROUTES } from "@/settings/routes";

const QdrantPlaygroundPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const permitted = await hasPermission(
    { context: "course", id: "all", type: "document" },
    "read",
  );

  if (!permitted) {
    return redirect(ROUTES.PRIVATE.root.getPath());
  }

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
