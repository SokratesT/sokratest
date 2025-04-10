"use client";

import { NewChatButton } from "@/components/chat/new-chat-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Chat } from "@/db/schema/chat";
import { ROUTES } from "@/settings/routes";
import { MessagesSquareIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { ChatCardOptions } from "./chat-card-options";
import { format } from "date-fns";

const ChatsList = ({ chats }: { chats: Chat[] }) => {
  if (!chats.length) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <CardTitle className="font-semibold text-xl">No chats yet</CardTitle>
          <CardDescription className="mt-4 flex flex-col items-center gap-4">
            Start a new chat to begin your learning journey
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <NewChatButton variant="outline">Start Learning</NewChatButton>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {chats.map((chat, i) => (
        <motion.div
          key={chat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link href={ROUTES.PRIVATE.chat.view.getPath({ id: chat.id })}>
            <Card className="relative h-full transition-all hover:border-primary/50 hover:shadow-md">
              <ChatCardOptions chatId={chat.id} />
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1 text-base">
                  {chat.title}
                </CardTitle>
                {chat.updatedAt && (
                  <CardDescription className="text-xs">
                    Last updated: {format(chat.updatedAt, "MMM dd, yyyy HH:mm")}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-muted-foreground text-sm">
                  <MessagesSquareIcon className="mr-2 h-4 w-4" />
                  Continue chat
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export { ChatsList };
