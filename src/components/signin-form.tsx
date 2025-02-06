"use client";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { type LoginSchemaType, loginSchema } from "@/lib/schemas/login";
import { routes } from "@/settings/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormInputField } from "./forms/fields/formInputField";
import { FormPasswordField } from "./forms/fields/formPasswordField";

export function SignInForm() {
  const router = useRouter();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: undefined,
      password: undefined,
    },
  });

  const onSubmit = async (values: LoginSchemaType) => {
    const { data, error } = await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onRequest: (ctx) => {
          //show loading
          console.log("loading");
        },
        onSuccess: (ctx) => {
          console.log("success");
          router.replace(routes.app.path);
        },
        onError: (ctx) => {
          console.log("error");
          alert(ctx.error.message);
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
        <Button type="submit">Login</Button>
      </form>
    </Form>
  );
}
