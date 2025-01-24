import { Placeholder } from "@/components/placeholder";
import { db } from "@/db/drizzle";
import { files } from "@/db/schema/files";
import { eq } from "drizzle-orm";
import { FileViewer } from "./_components/file-viewer";

const FilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const [file] = await db.select().from(files).where(eq(files.id, id));

  if (!file) {
    return <Placeholder>No such file</Placeholder>;
  }

  return <FileViewer fileInfo={file} />;
};

export default FilePage;
