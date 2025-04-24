"use client";

import { FormDatePicker } from "@/components/forms/fields/formDatePicker";
import { FormInputField } from "@/components/forms/fields/formInputField";
import { FormSelect } from "@/components/forms/fields/formSelect";
import { Placeholder } from "@/components/placeholders/placeholder";
import { DialogTrigger } from "@/components/plate-ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
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
    mode: "onSubmit", // Only validate when the form is submitted
  });

  const { fields, append, remove, replace } = useFieldArray({
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

  const handleBulkPaste = (event: React.FormEvent) => {
    event.preventDefault();
    const textArea = event.target as HTMLFormElement;
    const rawEmails = textArea.bulkEmails.value as string;

    const emails = rawEmails
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    // Replace the current fields with the new list
    replace(emails.map((email) => ({ email })));
  };

  if (isPending || isPendingActive || !organizations || !activeOrganization) {
    return <LoadingSpinner />;
  }

  if (organizations && activeOrganization) {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <Card className="order-last h-fit lg:order-first">
            <CardHeader>
              <CardTitle>Set invitation details</CardTitle>
              <CardDescription>
                These settings will apply to all users invited in this batch.
                Note that users will also automatically be added to the
                organisation corresponding to the course.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
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
              <Button type="submit" className="w-fit">
                Create Invitations
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add user emails</CardTitle>
              <CardDescription>
                Add the emails of users you want to invite. You can manually add
                each email, or all at once using &quot;Bulk Add Emails&quot;.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2">
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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ email: "" })}
                >
                  Add email field
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Bulk Add Emails</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Bulk Add Emails</DialogTitle>
                      <DialogDescription>
                        Add multiple emails at once once by pasting them here.
                        Make sure each email is on a new line and formatted
                        correctly.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleBulkPaste}
                      className="flex flex-col gap-4"
                    >
                      <Textarea
                        name="bulkEmails"
                        rows={5}
                        placeholder="Add emails here, separated by new lines"
                      />
                      <DialogClose asChild>
                        <Button type="submit">Add Emails</Button>
                      </DialogClose>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
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
