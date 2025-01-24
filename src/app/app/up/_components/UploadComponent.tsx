"use client";

import { FormSelect } from "@/components/forms/fields/formSelect";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ShortFileProp } from "@/lib/files/types";
import { getPresignedUrls, handleUpload } from "@/lib/files/uploadHelpers";
import { getErrorMessage } from "@/lib/handle-error";
import { searchParamsParser, urlKeys } from "@/lib/nuqs/search-params.bucket";
import {
  type FileUploadSchemaType,
  fileUploadSchema,
} from "@/lib/schemas/file-upload";
import { buckets } from "@/settings/buckets";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { FileUploader } from "./file-uploader-new";

export default function UploadComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const [{ bucket }] = useQueryStates(searchParamsParser, urlKeys);

  const onUploadSuccess = () => {
    console.log("Files uploaded successfully");
  };

  const onUpload = async (files: File[], bucket: string) => {
    setIsLoading(true);
    // validate files
    const filesInfo: ShortFileProp[] = files.map((file) => ({
      id: uuidv4(),
      originalFileName: file.name,
      fileSize: file.size,
      bucketName: bucket,
    }));

    const presignedUrls = await getPresignedUrls(filesInfo);

    // upload files to s3 endpoint directly and save file info to db
    await handleUpload(files, bucket, presignedUrls, onUploadSuccess);

    setIsLoading(false);
  };

  const form = useForm<FileUploadSchemaType>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      files: [],
      bucket,
    },
  });

  function onSubmit(input: FileUploadSchemaType) {
    setIsLoading(true);

    toast.promise(onUpload(input.files, input.bucket), {
      loading: "Uploading files...",
      success: () => {
        form.reset();
        setIsLoading(false);
        return "Files uploaded";
      },
      error: (err) => {
        setIsLoading(false);
        return getErrorMessage(err);
      },
    });
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-6"
        >
          <FormField
            control={form.control}
            name="bucket"
            render={({ field }) => (
              <FormSelect
                field={field}
                options={buckets.map((bucket) => ({
                  value: bucket.name,
                  label: bucket.name,
                }))}
                placeholder="test"
              />
            )}
          />
          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <div className="space-y-6">
                <FormItem className="w-full">
                  <FormLabel>Files</FormLabel>
                  <FormControl>
                    <FileUploader
                      value={field.value}
                      onValueChange={field.onChange}
                      maxFileCount={100}
                      maxSize={32 * 1024 * 1024}
                      multiple
                      accept={{
                        "image/*": [],
                        "video/*": [],
                        "audio/*": [],
                        "application/pdf": [],
                        "text/*": [],
                      }}
                      // progresses={progresses}
                      // pass the onUpload function here for direct upload
                      // onUpload={uploadFiles}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            )}
          />

          <Button className="w-fit" disabled={isLoading}>
            Save
          </Button>
        </form>
      </Form>
    </>
  );
}
