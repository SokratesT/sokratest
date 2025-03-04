import {
  adminClient,
  inferAdditionalFields,
  organizationClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { clientEnv } from "./env/client";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    usernameClient(),
    organizationClient(),
    inferAdditionalFields({
      session: {
        activeCourseId: {
          type: "string",
          required: false,
          input: true,
        },
      },
    }),
  ],
  baseURL: clientEnv.NEXT_PUBLIC_BASE_URL,
});
