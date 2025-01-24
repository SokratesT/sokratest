"use client";

import { FormInputField } from "@/components/forms/fields/formInputField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { type ProfileSchemaType, profileSchema } from "@/lib/schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const ProfileForm = () => {
  const { data, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProfileSchemaType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: data?.user.email,
      username: data?.user.name,
    },
  });

  useEffect(() => {
    form.reset({
      email: data?.user.email,
      username: data?.user.name,
    });

    if (!isPending && data) {
      setLoading(false);
    }
  }, [data]);

  const onSubmit = async (values: ProfileSchemaType) => {
    const { data, error } = await authClient.updateUser(
      {
        name: values.username,
      },
      {
        onRequest: (ctx) => {
          setSubmitting(true);
          console.log("loading");
        },
        onSuccess: (ctx) => {
          setSubmitting(false);
          console.log("success");
        },
        onError: (ctx) => {
          setSubmitting(false);
          console.log("error");
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormInputField
              field={field}
              placeholder="Email"
              inputType="email"
              loading={loading}
            />
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormInputField
              field={field}
              placeholder="Username"
              inputType="text"
              loading={loading}
            />
          )}
        />
        <Button type="submit" disabled={loading || submitting}>
          Save
        </Button>
      </form>
    </Form>
  );
};

export { ProfileForm };
