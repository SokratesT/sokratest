import { redirect } from "next/navigation";
import { UploadComponent } from "@/components/documents/upload-component";
import { hasPermission } from "@/lib/rbac";
import { ROUTES } from "@/settings/routes";

const AddDocumentPage = async () => {
  const permitted = await hasPermission(
    { context: "course", id: "all", type: "document" },
    "create",
  );

  if (!permitted) {
    return redirect(ROUTES.PRIVATE.root.getPath());
  }

  return (
    <div>
      <UploadComponent />
    </div>
  );
};

export default AddDocumentPage;
