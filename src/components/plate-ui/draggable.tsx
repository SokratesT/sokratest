"use client";

import { cn, withRef } from "@udecode/cn";
import { isType } from "@udecode/plate";
import {
  MemoizedChildren,
  ParagraphPlugin,
  type PlateRenderElementProps,
  type RenderNodeWrapper,
  useEditorRef,
  useElement,
  usePath,
  usePluginOption,
  useReadOnly,
  useSelected,
} from "@udecode/plate/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { useDraggable, useDropLine } from "@udecode/plate-dnd";
import { ExcalidrawPlugin } from "@udecode/plate-excalidraw/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { ColumnItemPlugin, ColumnPlugin } from "@udecode/plate-layout/react";
import {
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
} from "@udecode/plate-media/react";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import {
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import { GripVertical } from "lucide-react";
import React, { forwardRef, memo, useMemo } from "react";
import { STRUCTURAL_TYPES } from "@/components/editor/transforms";
import { TooltipButton } from "./tooltip";

const UNDRAGGABLE_KEYS = [
  ColumnItemPlugin.key,
  TableRowPlugin.key,
  TableCellPlugin.key,
];

export const DraggableAboveNodes: RenderNodeWrapper = (props) => {
  const { editor, element, path } = props;
  const readOnly = useReadOnly();

  const enabled = useMemo(() => {
    if (readOnly) return false;
    if (path.length === 1 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      return true;
    }
    if (path.length === 3 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(ColumnPlugin),
        },
      });

      if (block) {
        return true;
      }
    }
    if (path.length === 4 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(TablePlugin),
        },
      });

      if (block) {
        return true;
      }
    }

    return false;
  }, [editor, element, path, readOnly]);

  if (!enabled) return;

  // eslint-disable-next-line react/display-name
  return (props) => <Draggable {...props} />;
};

export const Draggable = withRef<"div", PlateRenderElementProps>(
  ({ className, ...props }, ref) => {
    const { children, editor, element, path } = props;
    const blockSelectionApi =
      editor.getApi(BlockSelectionPlugin).blockSelection;
    const { isDragging, previewRef, handleRef } = useDraggable({
      element,
      onDropHandler: (_, { dragItem }) => {
        const id = (dragItem as any).id;

        if (blockSelectionApi && id) {
          blockSelectionApi.set(id);
        }
      },
    });

    const isInColumn = path.length === 3;
    const isInTable = path.length === 4;

    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          isDragging && "opacity-50",
          STRUCTURAL_TYPES.includes(element.type)
            ? "group/structural"
            : "group",
        )}
      >
        {!isInTable && (
          <Gutter>
            <div
              className={cn(
                "slate-blockToolbarWrapper",
                "flex h-[1.5em]",
                isType(editor, element, [
                  HEADING_KEYS.h1,
                  HEADING_KEYS.h2,
                  HEADING_KEYS.h3,
                  HEADING_KEYS.h4,
                  HEADING_KEYS.h5,
                ]) && "h-[1.3em]",
                isInColumn && "h-4",
              )}
            >
              <div
                className={cn(
                  "slate-blockToolbar",
                  "pointer-events-auto mr-1 flex items-center",
                  isInColumn && "mr-1.5",
                )}
              >
                <div ref={handleRef} className="size-4">
                  <DragHandle />
                </div>
              </div>
            </div>
          </Gutter>
        )}

        <div ref={previewRef} className="slate-blockWrapper">
          <MemoizedChildren>{children}</MemoizedChildren>

          <DropLine />
        </div>
      </div>
    );
  },
);

Draggable.displayName = "Draggable";

const Gutter = ({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLDivElement>) => {
  const editor = useEditorRef();
  const element = useElement();
  const path = usePath();
  const isSelectionAreaVisible = usePluginOption(
    BlockSelectionPlugin,
    "isSelectionAreaVisible",
  );
  const selected = useSelected();

  const isNodeType = (keys: string[] | string) => isType(editor, element, keys);

  const isInColumn = path.length === 3;

  return (
    <div
      className={cn(
        "slate-gutterLeft",
        "-top-px -translate-x-full absolute z-50 flex h-full cursor-text hover:opacity-100 sm:opacity-0",
        STRUCTURAL_TYPES.includes(element.type)
          ? "group-hover/structural:opacity-100"
          : "group-hover:opacity-100",
        isSelectionAreaVisible && "hidden",
        !selected && "opacity-0",
        isNodeType(HEADING_KEYS.h1) && "pb-1 text-[1.875em]",
        isNodeType(HEADING_KEYS.h2) && "pb-1 text-[1.5em]",
        isNodeType(HEADING_KEYS.h3) && "pt-[2px] pb-1 text-[1.25em]",
        isNodeType([HEADING_KEYS.h4, HEADING_KEYS.h5]) &&
          "pt-[3px] pb-0 text-[1.1em]",
        isNodeType(HEADING_KEYS.h6) && "pb-0",
        isNodeType(ParagraphPlugin.key) && "pt-[3px] pb-0",
        isNodeType(["ul", "ol"]) && "pb-0",
        isNodeType(BlockquotePlugin.key) && "pb-0",
        isNodeType(CodeBlockPlugin.key) && "pt-6 pb-0",
        isNodeType([
          ImagePlugin.key,
          MediaEmbedPlugin.key,
          ExcalidrawPlugin.key,
          TogglePlugin.key,
          ColumnPlugin.key,
        ]) && "py-0",
        isNodeType([PlaceholderPlugin.key, TablePlugin.key]) && "pt-3 pb-0",
        isInColumn && "mt-2 h-4 pt-0",
        className,
      )}
      contentEditable={false}
      {...props}
    >
      {children}
    </div>
  );
};

const DragHandle = memo(() => {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <TooltipButton
      variant="ghost"
      className="h-6 w-4.5 p-0"
      onClick={() => {
        editor
          .getApi(BlockSelectionPlugin)
          .blockSelection.set(element.id as string);
      }}
      data-plate-prevent-deselect
      tooltip="Drag to move"
    >
      <GripVertical className="text-muted-foreground" />
    </TooltipButton>
  );
});

DragHandle.displayName = "DragHandle";

const DropLine = memo(
  forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
      const { dropLine } = useDropLine();

      if (!dropLine) return null;

      return (
        <div
          ref={ref}
          {...props}
          className={cn(
            "slate-dropLine",
            "absolute inset-x-0 h-0.5 opacity-100 transition-opacity",
            "bg-brand/50",
            dropLine === "top" && "-top-px",
            dropLine === "bottom" && "-bottom-px",
            className,
          )}
        />
      );
    },
  ),
);
