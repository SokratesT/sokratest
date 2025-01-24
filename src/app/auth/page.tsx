import { Auth } from "@/components/auth";
import { auth } from "@/lib/auth";
import { routes } from "@/settings/routes";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Authenticate",
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <Auth className="w-[400px]" />;
  } else {
    redirect(routes.app.path);
  }
}
