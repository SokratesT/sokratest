"use client";

import { FormDatePicker } from "@/components/forms/fields/formDatePicker";
import { FormInputField } from "@/components/forms/fields/formInputField";
import { FormSelect } from "@/components/forms/fields/formSelect";
import { Placeholder } from "@/components/placeholders/placeholder";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { createCourseInvitations } from "@/db/actions/course-invitation";
import type { Course } from "@/db/schema/course";
import {
  type CourseInvitationsInsertSchemaType,
  courseInvitationsInsertSchema,
} from "@/db/zod/course-invitation";
import { authClient } from "@/lib/auth-client";
import { isFieldRequired, withToastPromise } from "@/lib/utils";
import { courseRoles } from "@/settings/roles";
import { ROUTES } from "@/settings/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Building2Icon, CircleMinusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

const CourseInvitationForm = ({ courses }: { courses: Course[] }) => {
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization, isPending: isPendingActive } =
    authClient.useActiveOrganization();

  const router = useRouter();

  const form = useForm<CourseInvitationsInsertSchemaType>({
    resolver: zodResolver(courseInvitationsInsertSchema),
    defaultValues: {
      courseId: undefined,
      items: [{ email: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (values: CourseInvitationsInsertSchemaType) => {
    toast.promise(withToastPromise(createCourseInvitations(values)), {
      loading: "Creating course invitation...",
      success: () => {
        router.push(ROUTES.PRIVATE.users.invites.getPath());
        return "Course invitation created successfully";
      },
      error: (error) => ({
        message: "Failed to create course invitation",
        description: error.message,
      }),
    });
  };

  if (isPending || isPendingActive || !organizations || !activeOrganization) {
    return <LoadingSpinner />;
  }

  if (organizations && activeOrganization) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <p>Add Course Members</p>
          <p className="text-muted-foreground text-sm">
            You can add multiple course members at once by adding additional
            email fields.
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
                  required={isFieldRequired(
                    courseInvitationsInsertSchema,
                    "courseId",
                  )}
                />
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormSelect
                  field={field}
                  label="Role"
                  placeholder="Select role"
                  options={courseRoles.map((role) => ({
                    // TODO: Add seprate role labels and values
                    label: role,
                    value: role,
                  }))}
                  required={isFieldRequired(
                    courseInvitationsInsertSchema,
                    "role",
                  )}
                />
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormDatePicker
                  field={field}
                  label="Expires At"
                  showTimePicker={true}
                  placeholder="Select expiration date"
                  required={isFieldRequired(
                    courseInvitationsInsertSchema,
                    "expiresAt",
                  )}
                />
              )}
            />

            {fields.map((field, index) => (
              <div key={field.id}>
                <Label htmlFor={`items.${index}.email`}>
                  User {index + 1} Email
                </Label>
                <div className="flex flex-row items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.email`}
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
            <Button variant="outline" onClick={() => append({ email: "" })}>
              Add email field
            </Button>
            <Button type="submit">Create Invitations</Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Placeholder Icon={Building2Icon}>
      You need to join an organization first or create one yourself.
    </Placeholder>
  );
};

export { CourseInvitationForm };
