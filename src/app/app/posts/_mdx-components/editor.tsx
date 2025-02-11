"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
// ForwardRefEditor.tsx
import dynamic from "next/dynamic";
import { forwardRef } from "react";

// This is the only place InitializedMDXEditor is imported directly.
const Editor = dynamic(() => import("./InitializedMDXEditor"), {
  // Make sure we turn SSR off
  ssr: false,
  loading: () => <Skeleton className="h-[200px] w-full" />,
});

// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other props, including a ref.
export const ForwardRefEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
  (props, ref) => (
    <Editor
      {...props}
      editorRef={ref}
      className={cn(
        "min-h-[200px] rounded-xl border bg-card text-card-foreground shadow-sm",
        props.className,
      )}
    />
  ),
);

// TS complains without the following line
ForwardRefEditor.displayName = "ForwardRefEditor";
