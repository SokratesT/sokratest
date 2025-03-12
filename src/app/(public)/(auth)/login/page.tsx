import { SignInForm } from "@/components/signin-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/settings/routes";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login",
};

const LoginPage = async () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Sign in to your account to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        <Link href={routes.signup.path}>Create a new account?</Link>
      </CardFooter>
    </Card>
  );
};

export default LoginPage;
