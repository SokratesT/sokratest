"use client";

import { cn, withRef } from "@udecode/cn";
import { getHandler, IS_APPLE } from "@udecode/plate";
import {
  PlateElement,
  useFocused,
  useReadOnly,
  useSelected,
} from "@udecode/plate/react";
import type { TMentionElement } from "@udecode/plate-mention";
import { useIsMounted } from "usehooks-ts";

export const MentionElement = withRef<
  typeof PlateElement,
  {
    prefix?: string;
    onClick?: (mentionNode: any) => void;
  }
>(({ children, className, prefix, onClick, ...props }, ref) => {
  const element = props.element as TMentionElement;
  const selected = useSelected();
  const focused = useFocused();
  const ismounted = useIsMounted();
  const readOnly = useReadOnly();

  return (
    <PlateElement
      ref={ref}
      className={cn(
        className,
        "inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline font-medium text-sm",
        !readOnly && "cursor-pointer",
        selected && focused && "ring-2 ring-ring",
        element.children[0].bold === true && "font-bold",
        element.children[0].italic === true && "italic",
        element.children[0].underline === true && "underline",
      )}
      onClick={getHandler(onClick, element)}
      data-slate-value={element.value}
      contentEditable={false}
      draggable
      {...props}
    >
      {ismounted() && IS_APPLE ? (
        // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
        <>
          {children}
          {prefix}
          {element.value}
        </>
      ) : (
        // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
        <>
          {prefix}
          {element.value}
          {children}
        </>
      )}
    </PlateElement>
  );
});
