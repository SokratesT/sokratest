"use client";

import { createNewChat } from "@/actions/chat";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";

const NewChatButton = ({
  className,
  variant,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) => {
  const router = useRouter();

  const handleNewChat = async () => {
    const chatId = await createNewChat();
    router.push(`/app/chat/${chatId}`);
  };

  return (
    <Button
      {...props}
      onClick={handleNewChat}
      className={cn(buttonVariants({ variant, className }))}
    />
  );
};

export { NewChatButton };
