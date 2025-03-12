"server only";

import { db } from "@/db/drizzle";
import { type Invitation, invitation } from "@/db/schema/auth";
import { eq, getTableColumns } from "drizzle-orm";

export const getInvitationById = async (
  id: string,
): Promise<{ query: Invitation | undefined }> => {
  const [query] = await db
    .select({ ...getTableColumns(invitation) })
    .from(invitation)
    .where(eq(invitation.id, id))
    .limit(1);

  return { query };
};
