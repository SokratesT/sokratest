"use client";

import { FormInputField } from "@/components/forms/fields/formInputField";
import { FormSelect } from "@/components/forms/fields/formSelect";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import type { Course } from "@/db/schema/courses";
import { isFieldRequired } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CircleMinusIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

// Define Zod schema
const schema = z.object({
  courseId: z.string().nonempty("Please select a course"),
  items: z
    .array(
      z.object({
        userEmails: z.string().email("Field must be a valid email"),
      }),
    )
    .superRefine((items, ctx) => {
      const emails = items.map((item) => item.userEmails.toLowerCase());
      const uniqueEmails = new Set(emails);

      if (uniqueEmails.size !== emails.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Emails must be unique",
          path: ["root"],
        });
      }
    }),
});

type FormValues = z.infer<typeof schema>;

const AddUserForm = ({ courses }: { courses: Course[] }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      courseId: undefined,
      items: [{ userEmails: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (data: FormValues) => {
    console.log("Submitted data:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <p>Add Users</p>
        <p className="text-muted-foreground text-sm">
          You can add multiple users at once by adding additional email fields.
        </p>
        <div className="mt-8 flex max-w-[500px] flex-col gap-2">
          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormSelect
                field={field}
                label="Course"
                placeholder="Select course"
                options={courses.map((course) => ({
                  label: course.title,
                  value: course.id,
                }))}
                required={isFieldRequired(schema, "courseId")}
              />
            )}
          />

          {fields.map((field, index) => (
            <div key={field.id}>
              <Label htmlFor={`items.${index}.userEmails`}>
                User {index + 1} Email
              </Label>
              <div className="flex flex-row items-start gap-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.userEmails`}
                  render={({ field }) => (
                    <FormInputField
                      className="w-full"
                      field={field}
                      placeholder="User email"
                      inputType="email"
                    />
                  )}
                />
                {fields.length > 1 && (
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    <CircleMinusIcon />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {form.formState.errors.items?.root && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {form.formState.errors.items.root.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mt-4 flex flex-row gap-2">
          <Button variant="outline" onClick={() => append({ userEmails: "" })}>
            Add email field
          </Button>
          <Button type="submit">Invite Users</Button>
        </div>
      </form>
    </Form>
  );
};

export { AddUserForm };
