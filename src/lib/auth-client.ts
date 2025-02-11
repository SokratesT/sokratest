import {
  adminClient,
  organizationClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { clientEnv } from "./env/client";

export const authClient = createAuthClient({
  plugins: [adminClient(), usernameClient(), organizationClient()],
  baseURL: clientEnv.NEXT_PUBLIC_BASE_URL, // the base url of your auth server
});
