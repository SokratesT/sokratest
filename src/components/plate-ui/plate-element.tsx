"use client";

import type { PlateElementProps } from "@udecode/plate/react";
import { PlateElement as PlateElementPrimitive } from "@udecode/plate/react";
import { BlockSelection } from "./block-selection";

export const PlateElement = ({
  blockSelectionClassName,
  children,
  ...props
}: React.HTMLProps<HTMLDivElement> &
  PlateElementProps & { blockSelectionClassName?: string }) => {
  return (
    <PlateElementPrimitive {...props}>
      {children}

      {props.className?.includes("slate-selectable") && (
        <BlockSelection className={blockSelectionClassName} />
      )}
    </PlateElementPrimitive>
  );
};
