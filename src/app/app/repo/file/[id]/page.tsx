import { FileViewer } from "@/components/documents/file-viewer";
import { db } from "@/db/drizzle";
import {
  type FileRepository,
  fileRepository,
} from "@/db/schema/file-repository";
import { eq } from "drizzle-orm";

const EditFilePage = async ({
  params,
}: {
  params: Promise<{ id: FileRepository["id"] }>;
}) => {
  const { id } = await params;

  const [queryFile] = await db
    .select()
    .from(fileRepository)
    .where(eq(fileRepository.id, id));

  return <FileViewer fileInfo={queryFile} />;
};

export default EditFilePage;
