import { SignUpForm } from "@/components/auth/signup-form";
import { Placeholder } from "@/components/placeholders/placeholder";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCourseInvitationById } from "@/db/queries/invitation";
import type { CourseInvitation } from "@/db/schema/course-invitation";
import { ROUTES } from "@/settings/routes";
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
  let invitation: CourseInvitation | undefined;

  if (inv) {
    const { query } = await getCourseInvitationById(inv);

    if (query?.status !== "pending") {
      return (
        <Placeholder>
          Registration is currently restricted. If you have been invited, please
          check your invitation link.
        </Placeholder>
      );
    }

    invitation = query;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        {invitation ? (
          <SignUpForm invitation={invitation} />
        ) : (
          <Placeholder>
            Registration is currently restricted. If you have been invited,
            please check your invitation link.
          </Placeholder>
        )}
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        <Link href={ROUTES.PUBLIC.login.getPath()}>
          Already have an account?
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RegisterPage;
