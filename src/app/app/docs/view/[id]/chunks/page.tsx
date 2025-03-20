import { Markdown } from "@/components/chat/markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/drizzle";
import type { Document } from "@/db/schema/document";
import { embedding } from "@/db/schema/embedding";
import { eq } from "drizzle-orm";

const EditPostPage = async ({
  params,
}: {
  params: Promise<{ id: Document["id"] }>;
}) => {
  const { id } = await params;

  const queryFileChunks = await db
    .select()
    .from(embedding)
    .where(eq(embedding.fileId, id));

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
            <CardContent>
              <Markdown>{chunk.text}</Markdown>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EditPostPage;
