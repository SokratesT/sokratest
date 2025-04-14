"use client";

import { FormInputField } from "@/components/forms/fields/formInputField";
import { FormSelect } from "@/components/forms/fields/formSelect";
import { FormSwitch } from "@/components/forms/fields/formSwitch";
import { FormTextField } from "@/components/forms/fields/formTextField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { updateDocument } from "@/db/actions/document";
import type { Document } from "@/db/schema/document";
import {
  type DocumentUpdateSchemaType,
  documentUpdateSchema,
} from "@/db/zod/document";
import { withToastPromise } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const DocumentForm = ({ document }: { document: Document }) => {
  const router = useRouter();

  const form = useForm<DocumentUpdateSchemaType>({
    resolver: zodResolver(documentUpdateSchema),
    defaultValues: {
      id: document.id,
      title: document?.title ?? undefined,
      metadata: {
        citation: document.metadata?.citation ?? undefined,
        externalUrl: document.metadata?.externalUrl ?? undefined,
        relevance: document.metadata?.relevance ?? "medium",
        showReference: document.metadata?.showReference ?? true,
      },
    },
  });

  const onSubmit = async (values: DocumentUpdateSchemaType) => {
    toast.promise(withToastPromise(updateDocument(values)), {
      loading: "Updating document...",
      success: () => {
        router.push(ROUTES.PRIVATE.documents.root.getPath());
        return "Document updated successfully";
      },
      error: (error) => ({
        message: "Failed to update document",
        description: error.message,
      }),
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormInputField
              field={field}
              label="Title"
              placeholder="Document title"
              inputType="text"
              description="The title of the document. This will be displayed in the student chat view."
            />
          )}
        />
        <FormField
          control={form.control}
          name="metadata.citation"
          render={({ field }) => (
            <FormTextField
              field={field}
              label="Citation"
              placeholder="Citation"
              description="This citation will be displayed in the student chat view when the AI uses this document."
            />
          )}
        />
        <FormField
          control={form.control}
          name="metadata.externalUrl"
          render={({ field }) => (
            <FormInputField
              field={field}
              label="External URL"
              placeholder="moodle.com/course"
              inputType="text"
              description="This URL will be used to link to an external resource referencing the document in the student chat view, for example a deep link to your LMS."
            />
          )}
        />
        <FormField
          control={form.control}
          name="metadata.relevance"
          render={({ field }) => (
            <FormSelect
              field={field}
              options={[
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ]}
              placeholder="Select relevance"
              label="Relevance"
              description="Adjusts whether the document is used more frequently (scored higher) or less frequently (scored lower) in the AI's responses."
            />
          )}
        />
        <FormField
          control={form.control}
          name="metadata.showReference"
          render={({ field }) => (
            <FormSwitch
              field={field}
              label="Show Reference"
              description="Include a reference to this document in the student chat view when the AI uses it. When disabled, the AI can still use information from this document, but will not display a reference."
            />
          )}
        />
        <Button type="submit">Save Document</Button>
      </form>
    </Form>
  );
};

export { DocumentForm };
