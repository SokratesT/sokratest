import { Placeholder } from "@/components/placeholders/placeholder";
import { ManageUser } from "@/components/users/manage-user";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

const EditUserPage = async ({
  params,
}: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const [query] = await db.select().from(user).where(eq(user.id, id));

  if (!user) {
    return <Placeholder>No such user</Placeholder>;
  }

  return <ManageUser user={query} />;
};

export default EditUserPage;
