"use client";

import { FormInputField } from "@/components/forms/fields/formInputField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import type { Organization } from "@/db/schema/auth";
import {
  type OrganizationInsertSchemaType,
  organizationInsertSchema,
} from "@/db/zod/organization";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const OrganizationForm = ({
  organization,
}: { organization?: Organization }) => {
  const form = useForm<OrganizationInsertSchemaType>({
    resolver: zodResolver(organizationInsertSchema),
    defaultValues: {
      name: organization?.name ?? undefined,
      slug: organization?.slug ?? undefined,
    },
  });

  const onSubmit = async (values: OrganizationInsertSchemaType) => {
    if (organization) {
      await authClient.organization.update({
        data: {
          name: values.name,
          /* logo: "new-logo.url",
          metadata: {}, */
          slug: values.slug,
        },
        organizationId: organization.id,
      });
      toast.success("Organisation updated successfully");
    } else {
      await authClient.organization.create({
        name: values.name,
        slug: values.slug,
        // logo: "https://example.com/logo.png",
      });
      toast.success("Organisation created successfully");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormInputField
              field={field}
              label="Organisation Name"
              placeholder="Your organisation"
              inputType="text"
            />
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormInputField
              field={field}
              label="Organisation Slug"
              placeholder="your-organisation"
              inputType="text"
            />
          )}
        />
        <Button type="submit">Save Organisation</Button>
      </form>
    </Form>
  );
};

export { OrganizationForm };
