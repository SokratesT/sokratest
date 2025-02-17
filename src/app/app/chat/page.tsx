import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllChats } from "@/db/queries/chats";
import Link from "next/link";
import { DeleteChatButton } from "./_components/delete-chat-button";
import { NewChatButton } from "./_components/new-chat-button";

const ChatsPage = async () => {
  const query = await getAllChats();

  return (
    <div className="flex flex-col gap-14">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="max-w-xl font-regular text-3xl tracking-tighter md:text-5xl">
          Chats
        </h4>
        <div className="flex gap-2">
          <NewChatButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {query.map((q) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle>{q.title}</CardTitle>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="text-muted-foreground text-sm"
                >
                  {q.createdAt?.toISOString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button asChild>
                <Link href={`/app/chat/${q.id}`}>Chat</Link>
              </Button>
              <DeleteChatButton chatId={q.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChatsPage;
