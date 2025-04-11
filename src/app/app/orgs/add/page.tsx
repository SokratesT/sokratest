import { OrganizationForm } from "@/components/organizations/organization-form";
import { hasPermission } from "@/lib/rbac";
import { ROUTES } from "@/settings/routes";
import { redirect } from "next/navigation";

const AddOrganizationPage = async () => {
  const permitted = await hasPermission(
    { context: "organization", id: "all", type: "organization" },
    "create",
  );

  if (!permitted) {
    return redirect(ROUTES.PRIVATE.root.getPath());
  }

  return (
    <div>
      <OrganizationForm />
    </div>
  );
};

export default AddOrganizationPage;
