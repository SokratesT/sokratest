"use client";

import { useCreateEditor } from "@/components/editor/use-create-editor";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { cn } from "@/lib/utils";
import { Plate } from "@udecode/plate/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { defaultEditorText } from "./default-editor-text";

export function PlateEditor({
  options,
  onChange,
  readOnly = false,
  className,
}: {
  options?: { value: string | undefined };
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}) {
  const parsedValue = () => {
    try {
      if (!options?.value) return defaultEditorText;
      return JSON.parse(options.value);
    } catch (e) {
      return defaultEditorText;
    }
  };

  const editor = useCreateEditor({ value: parsedValue() });

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate
        readOnly={readOnly}
        editor={editor}
        onChange={(value) => onChange?.(JSON.stringify(value.value))}
      >
        <EditorContainer
          className={cn(!readOnly && "rounded-md border", className)}
        >
          <Editor variant="default" />
        </EditorContainer>
      </Plate>
    </DndProvider>
  );
}
