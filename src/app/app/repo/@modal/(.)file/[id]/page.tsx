import { InterceptingModal } from "@/app/app/posts/@modal/(.)edit/[id]/_components/intercepting-modal";
import { Placeholder } from "@/components/placeholder";
import { db } from "@/db/drizzle";
import {
  type FileRepository,
  fileRepository,
} from "@/db/schema/file-repository";
import { eq } from "drizzle-orm";
import { FileViewer } from "./_components/file-viewer";

const FilePage = async ({
  params,
}: { params: Promise<{ id: FileRepository["id"] }> }) => {
  const { id } = await params;

  const [file] = await db
    .select()
    .from(fileRepository)
    .where(eq(fileRepository.id, id));

  if (!file) {
    return <Placeholder>No such file</Placeholder>;
  }

  return (
    <InterceptingModal title={file.filename} className="h-5/6 w-4/5">
      <FileViewer fileInfo={file} />
    </InterceptingModal>
  );
};

export default FilePage;
