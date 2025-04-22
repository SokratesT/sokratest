import { SignUpForm } from "@/components/auth/signup-form";
import { SimplePlaceholder } from "@/components/placeholders/simple-placeholder";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCourseInvitationById } from "@/db/queries/course-invitation";
import type { CourseInvitation } from "@/db/schema/course-invitation";
import { ROUTES } from "@/settings/routes";
import { CalendarXIcon } from "lucide-react";
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
        <Card className="w-full max-w-md">
          <RegistrationDisabled className="border-0" />
        </Card>
      );
    }

    invitation = query;
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        {invitation ? (
          <div>
            {invitation.expiresAt < new Date() ? (
              <InvitationExpired />
            ) : (
              <SignUpForm invitation={invitation} />
            )}
          </div>
        ) : (
          <RegistrationDisabled />
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

const RegistrationDisabled = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <SimplePlaceholder className={className} {...props}>
      Registration is currently restricted. If you have been invited, please
      check your invitation link.
    </SimplePlaceholder>
  );
};

const InvitationExpired = () => {
  return (
    <SimplePlaceholder Icon={CalendarXIcon}>
      Your invitation has expired. Please contact the administrator for a new
      invitation.
    </SimplePlaceholder>
  );
};

export default RegisterPage;
