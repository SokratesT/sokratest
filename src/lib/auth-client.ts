import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { clientEnv } from "./env/client";

export const authClient = createAuthClient({
  plugins: [adminClient()],
  baseURL: clientEnv.NEXT_PUBLIC_BASE_URL, // the base url of your auth server
});
