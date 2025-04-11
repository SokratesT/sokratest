"use client";

import { buttonVariants } from "@/components/ui/button";
import { createChat } from "@/db/actions/chat";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSidebar } from "@/components/ui/sidebar";

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
  const { setOpenMobile } = useSidebar();

  const handleNewChat = async () => {
    const t = toast.promise(createChat(), {
      loading: "Creating new chat...",
      success: "New chat created",
      error: "Failed to create chat",
    });

    const res = await t.unwrap();

    const chatId = res?.data?.chat.id;

    if (!chatId) {
      return;
    }

    setOpenMobile(false);
    router.push(ROUTES.PRIVATE.chat.view.getPath({ id: chatId }));
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
