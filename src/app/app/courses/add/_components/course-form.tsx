"use client";

import { createCourse, updateCourse } from "@/actions/course";
import { PlateEditor } from "@/components/editor/plate-editor";
import { FormInputField } from "@/components/forms/fields/formInputField";
import { FormSelect } from "@/components/forms/fields/formSelect";
import { Placeholder } from "@/components/placeholder";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Course } from "@/db/schema/courses";
import { authClient } from "@/lib/auth-client";
import { type CourseSchemaType, courseSchema } from "@/lib/schemas/course";
import { isFieldRequired } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const CourseForm = ({ course }: { course?: Course }) => {
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization, isPending: isPendingActive } =
    authClient.useActiveOrganization();

  const form = useForm<CourseSchemaType>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title ?? undefined,
      description: course?.description ?? "",
      organizationId: course?.organizationId ?? activeOrganization?.id ?? "",
    },
  });

  const onSubmit = (values: CourseSchemaType) => {
    if (course) {
      updateCourse(values, course.id);
      toast.success("Course updated successfully");
    } else {
      createCourse(values);
      toast.success("Course created successfully");
    }
  };

  useEffect(() => {
    if (!activeOrganization) return;
    // FIXME: Doesnt work half the time...
    form.setValue("organizationId", activeOrganization.id);
  }, [activeOrganization]);

  if (isPending || isPendingActive || !organizations || !activeOrganization) {
    return <LoadingSpinner />;
  }

  if (organizations && activeOrganization) {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormSelect
                field={field}
                label="Organisation"
                placeholder="Select organisation"
                options={organizations.map((org) => ({
                  label: org.name,
                  value: org.id,
                }))}
                required={isFieldRequired(courseSchema, "organizationId")}
              />
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormInputField
                field={field}
                label="Title"
                placeholder="Course title"
                inputType="text"
                required={isFieldRequired(courseSchema, "title")}
              />
            )}
          />
          <div className="space-y-2">
            <Label>
              Course Description
              <span className="bold text-muted-foreground"> *</span>
            </Label>

            <PlateEditor
              options={{ value: form.getValues("description") }}
              onChange={(value) => form.setValue("description", value)}
            />
          </div>
          <Button type="submit">Save Course</Button>
        </form>
      </Form>
    );
  }

  return (
    <Placeholder Icon={Building2Icon}>
      You need to join an organizations first or create one yourself.
    </Placeholder>
  );
};

export { CourseForm };
