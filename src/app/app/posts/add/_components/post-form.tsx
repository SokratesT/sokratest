"use client";

import { createPost, updatePost } from "@/actions/post";
import { FormInputField } from "@/components/forms/fields/formInputField";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import type { posts } from "@/db/schema/posts";
import { type PostSchemaType, postSchema } from "@/lib/schemas/post";
import { zodResolver } from "@hookform/resolvers/zod";
import type { InferSelectModel } from "drizzle-orm";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ForwardRefEditor } from "../../_mdx-components/editor";

const PostForm = ({ post }: { post?: InferSelectModel<typeof posts> }) => {
  const form = useForm<PostSchemaType>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title ?? undefined,
      // TODO: Rename property to markdown
      html: post?.html ?? undefined,
    },
  });

  const onSubmit = (values: PostSchemaType) => {
    if (post) {
      updatePost(values, post.id);
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
              placeholder=""
              inputType="text"
            />
          )}
        />
        <div className="space-y-2">
          <Label>Content</Label>
          <ForwardRefEditor
            markdown={form.getValues("html")}
            onChange={(markdown) => {
              form.setValue("html", markdown);
            }}
            placeholder="Type your description here..."
          />
        </div>
        <Button type="submit">Save Post</Button>
      </form>
    </Form>
  );
};

export { PostForm };
