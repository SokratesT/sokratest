import { NewChatButton } from "@/components/chat/new-chat-button";
import { AppTourButton } from "@/components/next-step/app-tour-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/settings/routes";
import { FilesIcon, PlusIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";

const QuickActions = () => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-6">
        <Link href={`${routes.app.sub.chat.path}/new`}>
          <NewChatButton variant="secondary" className="w-full justify-start">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Chat
          </NewChatButton>
        </Link>

        <Link href={routes.app.sub.documents.path}>
          <Button variant="secondary" className="w-full justify-start">
            <FilesIcon className="mr-2 h-4 w-4" />
            Course Files
          </Button>
        </Link>

        <Link href={routes.app.sub.account.path}>
          <Button variant="secondary" className="w-full justify-start">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <AppTourButton />
      </CardContent>
    </Card>
  );
};

export { QuickActions };
