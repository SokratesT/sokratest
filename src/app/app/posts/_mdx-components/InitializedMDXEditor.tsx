"use client";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  Separator,
  UndoRedo,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
// InitializedMDXEditor.tsx
import type { ForwardedRef } from "react";

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      contentEditableClassName="prose"
      plugins={[
        // Example Plugin Usage
        headingsPlugin(),
        linkPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkDialogPlugin(),
        toolbarPlugin({
          toolbarClassName: "my-classname",
          toolbarContents: () => (
            <>
              {" "}
              <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
              <BlockTypeSelect />
              <ListsToggle />
              <InsertThematicBreak />
              <CreateLink />
              <Separator />
              <UndoRedo />
            </>
          ),
        }),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
