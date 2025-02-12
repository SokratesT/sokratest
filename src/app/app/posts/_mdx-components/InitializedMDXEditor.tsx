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
import type { ForwardedRef } from "react";

export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      contentEditableClassName="dark dark-editor"
      plugins={[
        headingsPlugin(),
        linkPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkDialogPlugin(),
        toolbarPlugin({
          toolbarClassName: "mdx-toolbar",
          toolbarContents: () => (
            <>
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
