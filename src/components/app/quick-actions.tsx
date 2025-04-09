import { NewChatButton } from "@/components/chat/new-chat-button";
import { AppTourButton } from "@/components/next-step/app-tour-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/settings/routes";
import { FilesIcon, PlusIcon, UserIcon } from "lucide-react";
import Link from "next/link";

const QuickActions = () => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-6">
        <NewChatButton variant="secondary" className="w-full justify-start">
          <PlusIcon className="mr-2 h-4 w-4" />
          New Chat
        </NewChatButton>

        <Link
          href={ROUTES.PRIVATE.documents.root.getPath()}
          className={buttonVariants({
            variant: "secondary",
            className: "w-full justify-start",
          })}
        >
          <FilesIcon className="mr-2 h-4 w-4" />
          Course Files
        </Link>

        <Link
          href={ROUTES.PRIVATE.app.account.getPath()}
          className={buttonVariants({
            variant: "secondary",
            className: "w-full justify-start",
          })}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          Account
        </Link>
        <AppTourButton />
      </CardContent>
    </Card>
  );
};

export { QuickActions };
