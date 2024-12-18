import { SearchParams } from "nuqs/server";
import { FileSidebar } from "./_components/file-sidebar";

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <FileSidebar searchParams={searchParams} />;
}
