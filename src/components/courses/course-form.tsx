"use client";

import { PlateEditor } from "@/components/editor/plate-editor";
import { FormInputField } from "@/components/forms/fields/formInputField";
import { FormTextField } from "@/components/forms/fields/formTextField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Placeholder } from "@/components/placeholders/placeholder";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createCourse, updateCourse } from "@/db/actions/course";
import type { Course } from "@/db/schema/course";
import {
  type CourseInsertSchemaType,
  courseInsertSchema,
} from "@/db/zod/course";
import { authClient } from "@/lib/auth-client";
import { isFieldRequired } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const CourseForm = ({ course }: { course?: Course }) => {
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization, isPending: isPendingActive } =
    authClient.useActiveOrganization();

  const form = useForm<CourseInsertSchemaType>({
    resolver: zodResolver(courseInsertSchema),
    defaultValues: {
      title: course?.title ?? undefined,
      description: course?.description ?? "",
      content: course?.content ?? "",
    },
  });

  const onSubmit = (values: CourseInsertSchemaType) => {
    if (course) {
      updateCourse({ ...values, id: course.id });
      toast.success("Course updated successfully");
    } else {
      createCourse(values);
      toast.success("Course created successfully");
    }
  };

  if (isPending || isPendingActive || !organizations || !activeOrganization) {
    return <LoadingSpinner />;
  }

  if (organizations && activeOrganization) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
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
            <Card>
              <CardHeader>
                {/* TODO: Actually implement this */}
                <CardTitle>Course Settings</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an LLM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Models</SelectLabel>
                      <SelectItem value="apple">Llama 3.1 70B</SelectItem>
                      <SelectItem value="banana">Deepseek R1</SelectItem>
                      <SelectItem value="blueberry">Mistral Large</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <div>
                  <div className="flex items-center space-x-2">
                    <Switch id="show-reasoning" checked />
                    <Label htmlFor="show-reasoning">Show Reasoning</Label>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Some models take internal reasoning steps before responding.
                    Select whether these should be shown to the user.
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <Switch id="show-reasoning" />
                    <Label htmlFor="show-reasoning">
                      Reflect on Document Retrieval
                    </Label>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    A secondary LLM reviews retrieved documents before they are
                    processed by the main response LLM. This improves quality,
                    but increases latency.
                  </p>
                </div>

                <div className="grid w-full gap-1.5">
                  <Label htmlFor="message-2">System Prompt</Label>
                  <Textarea
                    placeholder="Type your system prompt here."
                    id="message-2"
                  />
                  <p className="text-muted-foreground text-sm">
                    This is the system prompt that will be used for chats within
                    this course.
                  </p>
                </div>

                <div>
                  <Label htmlFor="message-2">Maximum References</Label>
                  <Slider defaultValue={[5]} max={10} step={1} />
                  <p className="text-muted-foreground text-sm">
                    The maximum number of references that can be used in a
                    response.
                  </p>
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
