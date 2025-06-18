"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PlateEditor } from "@/components/editor/plate-editor";
import { FormInputField } from "@/components/forms/fields/formInputField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { createPost, updatePost } from "@/db/actions/post";
import type { Post } from "@/db/schema/post";
import { type PostInsertSchemaType, postInsertSchema } from "@/db/zod/post";
import { withToastPromise } from "@/lib/utils";

const PostForm = ({ post }: { post?: Post }) => {
  const form = useForm<PostInsertSchemaType>({
    resolver: zodResolver(postInsertSchema),
    defaultValues: {
      title: post?.title ?? undefined,
      content: post?.content ?? "",
    },
  });

  const onSubmit = async (values: PostInsertSchemaType) => {
    if (post) {
      toast.promise(withToastPromise(updatePost({ ...values, id: post.id })), {
        loading: "Updating post...",
        success: "Post updated successfully",
        error: (error) => ({
          message: "Failed to update post",
          description: error.message,
        }),
      });
    } else {
      toast.promise(withToastPromise(createPost(values)), {
        loading: "Creating post...",
        success: "Post created successfully",
        error: (error) => ({
          message: "Failed to create post",
          description: error.message,
        }),
      });
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
