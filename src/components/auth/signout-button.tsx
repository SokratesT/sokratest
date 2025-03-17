"use client";

import { authClient } from "@/lib/auth-client";
import { routes } from "@/settings/routes";
import { Slot } from "@radix-ui/react-slot";
import { useRouter } from "next/navigation";

export const SignOutButton = ({
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
}) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(routes.root.path);
        },
      },
    });
  };

  const Comp = asChild ? Slot : "button";

  return <Comp onClick={handleSignOut} data-slot="button" {...props} />;
};
