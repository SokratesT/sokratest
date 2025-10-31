import { redirect } from "next/navigation";
import { ROUTES } from "@/settings/routes";

export default async function Home() {
  return redirect(ROUTES.PUBLIC.login.getPath());
}
