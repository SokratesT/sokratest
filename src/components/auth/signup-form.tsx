"use client";

import { FormInputField } from "@/components/forms/fields/formInputField";
import { FormPasswordField } from "@/components/forms/fields/formPasswordField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import type { Invitation } from "@/db/schema/auth";
import { type SignupSchemaType, signupSchema } from "@/db/zod/signup";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/settings/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const SignUpForm = ({ invitation }: { invitation?: Invitation }) => {
  const router = useRouter();

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: undefined,
      username: undefined,
      password: undefined,
      confirmPassword: undefined,
      invitationId: invitation?.id ?? undefined,
    },
  });

  const onSubmit = async (values: SignupSchemaType) => {
    const { data, error } = await authClient.signUp.email(
      {
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
      },
      {
        onRequest: (ctx) => {
          //show loading
          console.log("loading");
        },
        onSuccess: async (ctx) => {
          if (invitation?.id) {
            console.log("accepting invitation");
            await authClient.organization.acceptInvitation({
              invitationId: invitation?.id,
            });
          }

          router.replace(routes.app.path);
          console.log("success");
        },
        onError: (ctx) => {
          console.log("error");
          alert(ctx.error.message);
        },
      },
    );
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormInputField
                field={field}
                placeholder="Your Name"
                label="Name"
                inputType="text"
              />
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormInputField
                field={field}
                placeholder="Your Username"
                label="Username"
                inputType="text"
              />
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormInputField
                field={field}
                placeholder="your@email.com"
                label="Email"
                inputType="email"
              />
            )}
          />
          <FormField
            control={form.control}
            name="invitationId"
            render={({ field }) => (
              <FormInputField
                field={field}
                placeholder="Unique invitation code"
                label="Invitation Code"
                inputType="text"
              />
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormPasswordField
                field={field}
                placeholder="*******"
                label="Password"
                showTogglePassword
              />
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormPasswordField
                field={field}
                placeholder="*******"
                label="Confirm Password"
                showTogglePassword
              />
            )}
          />
          <Button type="submit">Sign Up</Button>
        </form>
      </Form>
    </>
  );
};

export { SignUpForm };
