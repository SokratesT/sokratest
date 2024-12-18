import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Home",
};

export default async function App() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello {session.user.name}!</CardTitle>
      </CardHeader>
      <CardContent>Content</CardContent>
    </Card>
  );
}
