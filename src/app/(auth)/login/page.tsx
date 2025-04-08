import { SignInForm } from "@/components/auth/signin-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

const LoginPage = async () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Sign in to your account to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
      {/* <CardFooter className="text-muted-foreground text-sm">
        <Link href={ROUTES.PUBLIC.signup.getPath()}>Create a new account?</Link>
      </CardFooter> */}
    </Card>
  );
};

export default LoginPage;
