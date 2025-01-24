"use client";

import { useMinimalTiptapEditor } from "@/components/minimal-tiptap/hooks/use-minimal-tiptap";
import { type Content, EditorContent } from "@tiptap/react";

const TipTapReader = ({ content }: { content: Content }) => {
  const editor = useMinimalTiptapEditor({
    value: content,
    editable: false,
  });

  return (
    <div className="w-full overflow-hidden">
      {editor && <EditorContent editor={editor} />}
    </div>
  );
};

export { TipTapReader };
