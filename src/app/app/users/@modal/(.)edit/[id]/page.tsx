import { InterceptingModal } from "@/app/app/posts/@modal/(.)edit/[id]/_components/intercepting-modal";
import { Placeholder } from "@/components/placeholder";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { ManageUser } from "../../../_components/manage-user";

const EditUserPage = async ({
  params,
}: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const [query] = await db.select().from(user).where(eq(user.id, id));

  if (!user) {
    return <Placeholder>No such user</Placeholder>;
  }

  return (
    <InterceptingModal title="Edit User">
      <ManageUser user={query} />
    </InterceptingModal>
  );
};

export default EditUserPage;
