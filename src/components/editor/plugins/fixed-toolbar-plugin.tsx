"use client";

import { createPlatePlugin, useEditorReadOnly } from "@udecode/plate/react";

import { FixedToolbar } from "@/components/plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "@/components/plate-ui/fixed-toolbar-buttons";

export const FixedToolbarPlugin = createPlatePlugin({
  key: "fixed-toolbar",
  render: {
    beforeEditable: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const readOnly = useEditorReadOnly();

      if (readOnly) return null;

      return (
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      );
    },
  },
});
