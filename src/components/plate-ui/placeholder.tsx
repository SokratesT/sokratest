"use client";

import { cn } from "@udecode/cn";
import { HEADING_KEYS } from "@udecode/plate-heading";
import {
  ParagraphPlugin,
  type PlaceholderProps,
  createNodeHOC,
  createNodesHOC,
  usePlaceholderState,
} from "@udecode/plate/react";
import { Children, cloneElement } from "react";

export const Placeholder = (props: PlaceholderProps) => {
  const { children, nodeProps, placeholder } = props;

  const { enabled } = usePlaceholderState(props);

  return Children.map(children, (child) => {
    return cloneElement(child, {
      className: child.props.className,
      nodeProps: {
        ...nodeProps,
        className: cn(
          enabled &&
            "before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]",
        ),
        placeholder,
      },
    });
  });
};

export const withPlaceholder = createNodeHOC(Placeholder);

export const withPlaceholdersPrimitive = createNodesHOC(Placeholder);

export const withPlaceholders = (components: any) =>
  withPlaceholdersPrimitive(components, [
    {
      key: ParagraphPlugin.key,
      hideOnBlur: true,
      placeholder: "Type a paragraph",
      query: {
        maxLevel: 1,
      },
    },
    {
      key: HEADING_KEYS.h1,
      hideOnBlur: false,
      placeholder: "Untitled",
    },
  ]);
