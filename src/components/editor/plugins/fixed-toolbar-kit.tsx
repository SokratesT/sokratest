"use client";

import { createPlatePlugin, useEditorReadOnly } from "platejs/react";

import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { FixedToolbarButtons } from "@/components/ui/fixed-toolbar-buttons";

const FixedToolbarRender = () => {
  const readOnly = useEditorReadOnly();

  if (readOnly) return null;

  return (
    <FixedToolbar>
      <FixedToolbarButtons />
    </FixedToolbar>
  );
};

export const FixedToolbarKit = [
  createPlatePlugin({
    key: "fixed-toolbar",
    render: {
      beforeEditable: FixedToolbarRender,
    },
  }),
];
