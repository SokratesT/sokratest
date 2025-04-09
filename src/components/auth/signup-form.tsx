"use client";

import { FormInputField } from "@/components/forms/fields/formInputField";
import { FormPasswordField } from "@/components/forms/fields/formPasswordField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import type { CourseInvitation } from "@/db/schema/course-invitation";
import { type SignupSchemaType, signupSchema } from "@/db/zod/signup";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/settings/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormSwitch } from "../forms/fields/formSwitch";

const SignUpForm = ({ invitation }: { invitation: CourseInvitation }) => {
  const router = useRouter();

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: invitation.email,
      username: undefined,
      password: undefined,
      confirmPassword: undefined,
      invitationId: invitation.id,
      privacyConsent: false,
    },
  });

  const onSubmit = async (values: SignupSchemaType) => {
    if (invitation.id !== values.invitationId) {
      return;
    }

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
          console.log("success");
          router.replace(
            ROUTES.PRIVATE.app.init.getPath({ inv: invitation.id }),
          );
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
              disabled={invitation && true}
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
              disabled={invitation && true}
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
        <div className="flex flex-col gap-2">
          <p className="font-bold">Privacy Policy</p>
          <p className="text-muted-foreground text-sm">
            By signing up, you agree to our Privacy Policy.
          </p>
          {/* TODO: Implement as Modal */}
          <Button size="sm">Review</Button>
          <FormField
            control={form.control}
            name="privacyConsent"
            render={({ field }) => (
              <FormSwitch
                field={field}
                description="Yes, I have read and understood the privacy policy for use of the SokratesT platform."
              />
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
    </Form>
  );
};

export { SignUpForm };
