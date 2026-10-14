"use client";

import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { EditorKit } from "@/components/editor/editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { cn } from "@/lib/utils";
import { defaultEditorText } from "./default-editor-text";

const parseValue = (value: string | undefined): Value => {
  try {
    if (!value) return defaultEditorText;
    return JSON.parse(value);
  } catch (_e) {
    return defaultEditorText;
  }
};

const PlateEditor = ({
  options,
  onChange,
  readOnly = false,
  className,
}: {
  options?: { value: string | undefined };
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}) => {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: parseValue(options?.value),
  });

  return (
    <Plate
      readOnly={readOnly}
      editor={editor}
      onChange={({ value }) => onChange?.(JSON.stringify(value))}
    >
      <EditorContainer
        className={cn(!readOnly && "rounded-md border", className)}
      >
        <Editor variant={readOnly ? "none" : "default"} readOnly={readOnly} />
      </EditorContainer>
    </Plate>
  );
};

export { PlateEditor };
