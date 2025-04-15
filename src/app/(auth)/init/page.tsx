import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema/auth";
import { ROUTES } from "@/settings/routes";
import { count } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminRegistrationForm } from "./_components/admin-registration-form";

export const metadata: Metadata = {
  title: "Admin Setup",
};

const InitPage = async () => {
  let userCount = 0;

  try {
    const [query] = await db.select({ count: count() }).from(user);
    userCount = query.count;
  } catch (error) {
    console.error("Error fetching user count:", error);
  }

  if (userCount > 0) {
    redirect(ROUTES.PRIVATE.root.getPath());
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Admin Setup</CardTitle>
        <CardDescription>
          Create your admin account to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AdminRegistrationForm />
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        This form is only shown for the initial setup of the application.
      </CardFooter>
    </Card>
  );
};

export default InitPage;
