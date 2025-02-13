import { db } from "@/db/drizzle";
import {
  type FileRepository,
  fileRepository,
} from "@/db/schema/file-repository";
import { eq } from "drizzle-orm";
import { FileViewer } from "../../@modal/(.)file/[id]/_components/file-viewer";

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
