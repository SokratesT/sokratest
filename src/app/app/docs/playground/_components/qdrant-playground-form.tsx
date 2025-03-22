"use client";

import { FormInputField } from "@/components/forms/fields/formInputField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import {
  type QdrantPlaygroundSearchSchemaType,
  qdrantPlaygroundSearchSchema,
} from "@/db/zod/qdrant";
import { useQuerySearchParams } from "@/lib/nuqs/search-params.search";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

const QdrantPlaygroundForm = () => {
  const [isLoading, startTransition] = useTransition();
  const [query, setQuery] = useQuerySearchParams(startTransition);

  const form = useForm<QdrantPlaygroundSearchSchemaType>({
    resolver: zodResolver(qdrantPlaygroundSearchSchema),
    defaultValues: {
      search: query.search ?? undefined,
    },
  });

  const onSubmit = (values: QdrantPlaygroundSearchSchemaType) => {
    setQuery((prev) => ({
      ...prev,
      search: values.search,
    }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormInputField
              className="w-full"
              field={field}
              placeholder="Your search query..."
              inputType="text"
            />
          )}
        />
        <Button type="submit" disabled={isLoading}>
          Search
        </Button>
      </form>
    </Form>
  );
};

export { QdrantPlaygroundForm };
