import { ManageOrganization } from "@/components/organizations/manage-organization";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { getOrganizationById } from "@/db/queries/organizations";
import { user } from "@/db/schema/auth";

const EditOrganizationPage = async ({
  params,
}: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const { query } = await getOrganizationById(id);

  if (!user) {
    return <Placeholder>No such organisation</Placeholder>;
  }

  return <ManageOrganization organization={query} />;
};

export default EditOrganizationPage;
