"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PlateEditor } from "@/components/editor/plate-editor";
import { FormInputField } from "@/components/forms/fields/formInputField";
import { FormSelect } from "@/components/forms/fields/formSelect";
import { FormTextField } from "@/components/forms/fields/formTextField";
import { Placeholder } from "@/components/placeholders/placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { createCourse, updateCourse } from "@/db/actions/course";
import type { Course } from "@/db/schema/course";
import {
  type CourseInsertSchemaType,
  courseInsertSchema,
} from "@/db/zod/course";
import { saiaModels } from "@/lib/ai/saia-models";
import { authClient } from "@/lib/auth-client";
import { isFieldRequired, withToastPromise } from "@/lib/utils";
import { ROUTES } from "@/settings/routes";

const CourseForm = ({ course }: { course?: Course }) => {
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization, isPending: isPendingActive } =
    authClient.useActiveOrganization();

  const router = useRouter();

  const form = useForm<CourseInsertSchemaType>({
    resolver: zodResolver(courseInsertSchema),
    defaultValues: {
      title: course?.title ?? undefined,
      description: course?.description ?? "",
      content: course?.content ?? "",
      config: {
        systemPrompt: course?.config?.systemPrompt ?? "",
        maxReferences: course?.config?.maxReferences ?? 5,
        model: course?.config?.model ?? "",
      },
    },
  });

  const onSubmit = (values: CourseInsertSchemaType) => {
    if (course) {
      toast.promise(
        withToastPromise(updateCourse({ ...values, id: course.id })),
        {
          loading: "Updating course...",
          success: () => {
            router.back();
            return "Course updated successfully";
          },
          error: (error) => ({
            message: "Failed to update course",
            description: error.message,
          }),
        },
      );
    } else {
      toast.promise(withToastPromise(createCourse(values)), {
        loading: "Creating course...",
        success: (result) => {
          router.push(
            ROUTES.PRIVATE.courses.view.getPath({ id: result.courseId }),
          );
          return "Course created successfully";
        },
        error: (error) => ({
          message: "Failed to create course",
          description: error.message,
        }),
      });
    }
  };

  if (isPending || isPendingActive || !organizations || !activeOrganization) {
    return <LoadingSpinner />;
  }

  if (organizations && activeOrganization) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardContent className="flex flex-col gap-4 p-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormInputField
                      field={field}
                      label="Title"
                      placeholder="Course title"
                      inputType="text"
                      required={isFieldRequired(courseInsertSchema, field.name)}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormTextField
                      field={field}
                      label="Short Description"
                      placeholder="Short course description"
                      required={isFieldRequired(courseInsertSchema, field.name)}
                    />
                  )}
                />
                <div className="space-y-2">
                  <Label>
                    Course Description
                    <span className="bold text-muted-foreground"> *</span>
                  </Label>

                  <PlateEditor
                    options={{ value: form.getValues("content") }}
                    onChange={(value) => form.setValue("content", value)}
                    className="h-[600px]"
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Course AI Settings</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid w-full gap-1.5">
                  <FormField
                    control={form.control}
                    name="config.model"
                    render={({ field }) => (
                      <FormSelect
                        field={field}
                        options={saiaModels.map((model) => ({
                          value: model.id,
                          label: model.name,
                        }))}
                        label="Model"
                        placeholder="Choose an AI Model"
                        required={isFieldRequired(
                          courseInsertSchema,
                          field.name,
                        )}
                      />
                    )}
                  />
                </div>

                <div className="grid w-full gap-1.5">
                  <FormField
                    control={form.control}
                    name="config.systemPrompt"
                    render={({ field }) => (
                      <FormTextField
                        field={field}
                        rows={10}
                        label="System Prompt"
                        placeholder="Your custom system prompt..."
                        required={isFieldRequired(
                          courseInsertSchema,
                          field.name,
                        )}
                      />
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="config.maxReferences"
                    render={({ field }) => (
                      <FormInputField
                        field={field}
                        label="Maximum References"
                        placeholder="5"
                        required={isFieldRequired(
                          courseInsertSchema,
                          field.name,
                        )}
                        inputType="number"
                        description="The maximum number of references that can be used in a
                    response. Note that this is referring to the number of individual chunks received by the AI,
                    which may stem from the same document. This therefore does not directly correlate to the
                    number of references cited in the response."
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
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
