"use client";

import { FormInputField } from "@/components/forms/fields/formInputField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { type UserUpdateSchemaType, userUpdateSchema } from "@/db/zod/profile";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const ProfileForm = () => {
  const { data, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UserUpdateSchemaType>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      email: data?.user.email,
      name: data?.user.name,
      username: data?.user.username,
    },
  });

  // FIXME: Pass data as props instead of this shit?
  useEffect(() => {
    form.reset({
      email: data?.user.email,
      name: data?.user.name,
      username: data?.user.username,
    });

    if (!isPending && data) {
      setLoading(false);
    }
  }, [data]);

  const onSubmit = async (values: UserUpdateSchemaType) => {
    const { data, error } = await authClient.updateUser(
      {
        name: values.name,
        username: values.username,
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
              placeholder="your@email.com"
              label="Email"
              inputType="email"
              loading={loading}
            />
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormInputField
              field={field}
              placeholder="Your name"
              label="Name"
              inputType="text"
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
              placeholder="Your username"
              label="Username"
              inputType="text"
              loading={loading}
            />
          )}
        />
        <Button type="submit" disabled={loading || submitting}>
          Save Profile
        </Button>
      </form>
    </Form>
  );
};

export { ProfileForm };
