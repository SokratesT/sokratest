"server only";

import { db } from "@/db/drizzle";
import type { Session } from "better-auth";
import { eq } from "drizzle-orm";
import { member } from "../schema/auth";

export const getUserOrganizationsOnLogin = async (session: Session) => {
  if (!session) {
    throw new Error("Not authenticated");
  }

  return db
    .select({ id: member.organizationId })
    .from(member)
    .where(eq(member.userId, session.userId));
};
