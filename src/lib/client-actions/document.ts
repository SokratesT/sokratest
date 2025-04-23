import type {
  ConfirmContextValue,
  ConfirmFunction,
} from "@/components/ui/dialog/confirm-dialog";
import { deleteDocumentInfo } from "@/db/actions/document";
import { withToastPromise } from "@/lib/utils";
import { toast } from "sonner";

export const handleDeleteDocuments = async ({
  confirm,
  refs,
}: {
  confirm: ConfirmFunction & {
    updateConfig: ConfirmContextValue["updateConfig"];
  };
  refs: { id: string }[];
}) => {
  const p = refs.length > 1 ? "s" : "";

  const isConfirmed = await confirm({
    title: `Delete Document${p}`,
    description: `Are you sure you want to delete ${p === "s" ? "these" : "this"} document${p}?`,
    confirmText: "Delete",
    cancelText: "Cancel",
  });

  if (isConfirmed) {
    toast.promise(withToastPromise(deleteDocumentInfo({ refs })), {
      loading: `Deleting document${p}...`,
      success: () => {
        return `Document${p} deleted`;
      },
      error: (error) => ({
        message: `Failed to delete document${p}`,
        description: error.message,
      }),
    });
  }
};
