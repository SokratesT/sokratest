"use client";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { type SignupSchemaType, signupSchema } from "@/lib/schemas/signup";
import { routes } from "@/settings/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormInputField } from "./forms/fields/formInputField";
import { FormPasswordField } from "./forms/fields/formPasswordField";

const SignUpForm = () => {
  const router = useRouter();

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: undefined,
      username: undefined,
      password: undefined,
      confirmPassword: undefined,
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
        onSuccess: (ctx) => {
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
