"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/settings/routes";

export const SendVerificationEmail = () => {
  const session = authClient.useSession();

  if (session.isPending) {
    return <p>Loading...</p>;
  }

  if (session.data?.user.emailVerified) {
    return <p>verified</p>;
  }

  const handleClick = async () => {
    if (!session.data) return;

    await authClient.sendVerificationEmail({
      email: session.data.user.email,
      callbackURL: ROUTES.PUBLIC.root.getPath(),
    });

    console.log("Verification email sent");
  };

  return <Button onClick={handleClick}>Send Verification Email</Button>;
};
