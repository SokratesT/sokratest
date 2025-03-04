import { InterceptingModal } from "@/app/app/posts/@modal/(.)edit/[id]/_components/intercepting-modal";
import { Placeholder } from "@/components/placeholder";
import { getOrganizationById } from "@/db/queries/organizations";
import { user } from "@/db/schema/auth";
import { ManageOrganization } from "../../../_components/manage-organization";

const EditOrganizationPage = async ({
  params,
}: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const { query } = await getOrganizationById(id);

  if (!user) {
    return <Placeholder>No such organisation</Placeholder>;
  }

  return (
    <InterceptingModal title="Edit Organisation">
      <ManageOrganization organization={query} />
    </InterceptingModal>
  );
};

export default EditOrganizationPage;
