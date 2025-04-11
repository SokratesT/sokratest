import { hasPermission } from "@/lib/rbac";
import { ROUTES } from "@/settings/routes";
import { redirect } from "next/navigation";
import { PostForm } from "./_components/post-form";

const AddPostPage = async () => {
  const permitted = await hasPermission(
    { context: "organization", id: "all", type: "post" },
    "create",
  );

  if (!permitted) {
    return redirect(ROUTES.PRIVATE.root.getPath());
  }

  return <PostForm />;
};

export default AddPostPage;
