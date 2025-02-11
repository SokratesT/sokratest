"use client";

import { FormInputField } from "@/components/forms/fields/formInputField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import type { organization as organizationDbSchema } from "@/db/schema/auth";
import { authClient } from "@/lib/auth-client";
import {
  type OrganizationSchemaType,
  organizationSchema,
} from "@/lib/schemas/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import type { InferSelectModel } from "drizzle-orm";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const OrganizationForm = ({
  organization,
}: { organization?: InferSelectModel<typeof organizationDbSchema> }) => {
  const form = useForm<OrganizationSchemaType>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name ?? undefined,
      slug: organization?.slug ?? undefined,
    },
  });

  const onSubmit = async (values: OrganizationSchemaType) => {
    if (organization) {
      await authClient.organization.update({
        data: {
          name: values.name,
          /* logo: "new-logo.url",
          metadata: {
            customerId: "test"
          }, */
          slug: values.slug,
        },
        organizationId: organization.id, //defaults to the current active organization
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
