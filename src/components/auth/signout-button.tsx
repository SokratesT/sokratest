"use client";

import { Slot } from "@radix-ui/react-slot";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUmami } from "@/hooks/use-umami";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/settings/routes";

export const SignOutButton = ({
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
}) => {
  const router = useRouter();
  const { trackEvent } = useUmami();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: (_ctx) => {
          trackEvent("auth-signout");
          toast.message("Goodbye!");
          router.push(ROUTES.PUBLIC.root.getPath());
        },
      },
    });
  };

  const Comp = asChild ? Slot : "button";

  return <Comp onClick={handleSignOut} data-slot="button" {...props} />;
};
