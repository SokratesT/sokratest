"use client";

import useMinimalTiptapEditor from "@/components/minimal-tiptap/hooks/use-minimal-tiptap";
import { Content, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

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
