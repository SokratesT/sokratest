"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateLeaf } from "@udecode/plate/react";
import React from "react";

export const CodeSyntaxLeaf = withRef<typeof PlateLeaf>(
  ({ children, className, ...props }, ref) => {
    const tokenClassName = props.leaf.className as string;

    return (
      <PlateLeaf ref={ref} {...props} className={cn(tokenClassName, className)}>
        {children}
      </PlateLeaf>
    );
  },
);
