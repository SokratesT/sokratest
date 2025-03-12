import { SignUpForm } from "@/components/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getInvitationById } from "@/db/queries/invitation";
import type { Invitation } from "@/db/schema/auth";
import { routes } from "@/settings/routes";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Register",
};

const RegisterPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ inv: string | undefined }>;
}) => {
  const { inv } = await searchParams;
  let invitation: Invitation | undefined;

  if (inv) {
    const { query } = await getInvitationById(inv);
    invitation = query;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm invitation={invitation} />
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        <Link href={routes.login.path}>Already have an account?</Link>
      </CardFooter>
    </Card>
  );
};

export default RegisterPage;
