import { OrganizationForm } from "@/components/organizations/organization-form";
import { getSession } from "@/db/queries/auth";
import { hasPermission } from "@/lib/rbac";
import { ROUTES } from "@/settings/routes";
import { redirect } from "next/navigation";

const AddOrganizationPage = async () => {
  const session = await getSession();

  const permitted = await hasPermission(
    { context: "organization", id: "all", type: "organization" },
    "create",
  );

  if (!permitted && session?.user.role !== "admin") {
    return redirect(ROUTES.PRIVATE.root.getPath());
  }

  return (
    <div>
      <OrganizationForm />
    </div>
  );
};

export default AddOrganizationPage;
