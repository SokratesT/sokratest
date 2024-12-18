"use client";

import { createPost, updatePost } from "@/actions/post";
import { FormInputField } from "@/components/forms/fields/formInputField";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { posts } from "@/db/schema/posts";
import { postSchema, PostSchemaType } from "@/lib/schemas/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const PostForm = ({ post }: { post?: InferSelectModel<typeof posts> }) => {
  const form = useForm<PostSchemaType>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title ?? undefined,
      html: post?.html ?? undefined,
      /* json: undefined, */
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
          <MinimalTiptapEditor
            value={form.getValues("html")}
            onChange={(content) => {
              form.setValue("html", (content as string) ?? "");
              /* form.setValue("json", JSON.stringify(content)); */
            }}
            className="w-full"
            editorContentClassName="p-5"
            output="html"
            placeholder="Type your description here..."
            // autofocus={true}
            editable={true}
            editorClassName="focus:outline-none"
          />
        </div>
        <Button type="submit">Save Post</Button>
      </form>
    </Form>
  );
};

export { PostForm };
