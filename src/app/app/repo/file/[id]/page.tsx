import { db } from "@/db/drizzle";
import { files } from "@/db/schema/files";
import { eq } from "drizzle-orm";
import { FileViewer } from "../../@modal/(.)file/[id]/_components/file-viewer";

const EditPostPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const [queryFile] = await db.select().from(files).where(eq(files.id, id));

  return <FileViewer fileInfo={queryFile} />;
};

export default EditPostPage;
