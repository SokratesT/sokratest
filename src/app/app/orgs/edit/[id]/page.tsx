import { ManageOrganization } from "@/components/organizations/manage-organization";
import { Placeholder } from "@/components/ui/custom/placeholder";
import { getOrganizationById } from "@/db/queries/organizations";

const EditOrganizationPage = async ({
  params,
}: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const result = await getOrganizationById(id);

  if (!result.success) {
    return <Placeholder>{result.error.message}</Placeholder>;
  }

  if (!result.data.query) {
    return <Placeholder>No such organisation</Placeholder>;
  }

  return <ManageOrganization organization={result.data.query} />;
};

export default EditOrganizationPage;
