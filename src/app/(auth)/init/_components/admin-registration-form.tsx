"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormInputField } from "@/components/forms/fields/formInputField";
import { FormPasswordField } from "@/components/forms/fields/formPasswordField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { createAdmin } from "@/db/actions/user";
import { ROUTES } from "@/settings/routes";

// Define the schema for our form
const adminRegistrationSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type AdminRegistrationSchemaType = z.infer<typeof adminRegistrationSchema>;

export const AdminRegistrationForm = () => {
  const router = useRouter();

  const form = useForm<AdminRegistrationSchemaType>({
    resolver: zodResolver(adminRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: AdminRegistrationSchemaType) => {
    toast.promise(
      createAdmin({
        email: values.email,
        password: values.password,
        name: values.name,
      }),
      {
        loading: "Creating admin account...",
        success: () => {
          router.push(ROUTES.PRIVATE.root.getPath());
          return "Admin account created successfully";
        },
        error: "Failed to create admin account",
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormInputField
              field={field}
              placeholder="Your Name"
              label="Name"
              inputType="text"
              required
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
              required
            />
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormPasswordField
              field={field}
              placeholder="Password"
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
              placeholder="Password"
              label="Confirm Password"
              showTogglePassword
            />
          )}
        />

        <Button type="submit" className="w-full">
          Create Admin Account
        </Button>
      </form>
    </Form>
  );
};
