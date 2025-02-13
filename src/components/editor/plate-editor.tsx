"use client";

import { useCreateEditor } from "@/components/editor/use-create-editor";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { Plate } from "@udecode/plate/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export function PlateEditor({
  options,
  onChange,
  readOnly = false,
}: {
  options?: { value: string | undefined };
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  const editor = useCreateEditor({ value: options?.value });

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate
        readOnly={readOnly}
        editor={editor}
        onChange={(value) => onChange?.(JSON.stringify(value.value))}
      >
        <EditorContainer>
          <Editor variant="default" />
        </EditorContainer>
      </Plate>
    </DndProvider>
  );
}
