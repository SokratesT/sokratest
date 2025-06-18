"use client";

import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { createChat } from "@/db/actions/chat";
import { useUmami } from "@/hooks/use-umami";
import { cn, withToastPromise } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";

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
  const { trackEvent } = useUmami();

  const handleNewChat = async () => {
    const t = toast.promise(withToastPromise(createChat()), {
      loading: "Creating new chat...",
      success: (res) => {
        trackEvent("chat-create", { chatId: res.chat.id });
        return "New chat created";
      },
      error: (error) => ({
        message: "Failed to create chat",
        description: error.message,
      }),
    });

    const res = await t.unwrap();

    const chatId = res?.chat.id;

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
