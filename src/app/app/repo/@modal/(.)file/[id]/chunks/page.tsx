import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/drizzle";
import { embeddings } from "@/db/schema/embeddings";
import { files } from "@/db/schema/files";
import { eq } from "drizzle-orm";

const EditPostPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const [queryFile] = await db.select().from(files).where(eq(files.id, id));
  const queryFileChunks = await db
    .select()
    .from(embeddings)
    .where(eq(embeddings.fileId, id));

  return (
    <div className="grid grid-cols-1 gap-2">
      {queryFileChunks.map((chunk) => {
        return (
          <Card key={chunk.id}>
            <CardHeader>
              <CardTitle>
                {chunk.fileId} / {chunk.nodeId}
              </CardTitle>
            </CardHeader>
            <CardContent>{chunk.text}</CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EditPostPage;
