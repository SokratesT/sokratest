"use client";

import { PlateEditor } from "@/components/editor/plate-editor";
import { FormInputField } from "@/components/forms/fields/formInputField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { createPost, updatePost } from "@/db/actions/post";
import type { Post } from "@/db/schema/post";
import { type PostInsertSchemaType, postInsertSchema } from "@/db/zod/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const PostForm = ({ post }: { post?: Post }) => {
  const form = useForm<PostInsertSchemaType>({
    resolver: zodResolver(postInsertSchema),
    defaultValues: {
      title: post?.title ?? undefined,
      content: post?.content ?? "",
    },
  });

  const onSubmit = (values: PostInsertSchemaType) => {
    if (post) {
      updatePost({ ...values, id: post.id });
      toast.success("Post updated successfully");
    } else {
      createPost(values);
      toast.success("Post created successfully");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormInputField
              field={field}
              label="Title"
              placeholder="Post title"
              inputType="text"
            />
          )}
        />
        <div className="space-y-2">
          <Label>Content</Label>

          <PlateEditor
            options={{ value: form.getValues("content") }}
            onChange={(value) => form.setValue("content", value)}
          />
        </div>
        <Button type="submit">Save Post</Button>
      </form>
    </Form>
  );
};

export { PostForm };
