"use client";

import { createNewChat } from "@/actions/chat";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";

const NewChatButton = ({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) => {
  const router = useRouter();

  const handleNewChat = async () => {
    const chatId = await createNewChat();
    router.push(`/app/chat/${chatId}`);
  };

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      onClick={handleNewChat}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};

export { NewChatButton };
