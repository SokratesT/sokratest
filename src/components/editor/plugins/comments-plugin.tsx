"use client";

import type { ExtendConfig, Path } from "@udecode/plate";

import { isSlateString } from "@udecode/plate";
import {
  type BaseCommentsConfig,
  BaseCommentsPlugin,
} from "@udecode/plate-comments";
import { toTPlatePlugin, useHotkeys } from "@udecode/plate/react";

export type CommentsConfig = ExtendConfig<
  BaseCommentsConfig,
  {
    activeId: string | null;
    commentingBlock: Path | null;
    hotkey: string[];
    hoverId: string | null;
    uniquePathMap: Map<string, Path>;
  }
>;

export const commentsPlugin = toTPlatePlugin<CommentsConfig>(
  BaseCommentsPlugin,
  {
    handlers: {
      onClick: ({ api, event, setOption, type }) => {
        let leaf = event.target as HTMLElement;
        let isSet = false;

        const unsetActiveSuggestion = () => {
          setOption("activeId", null);
          isSet = true;
        };

        if (!isSlateString(leaf)) unsetActiveSuggestion();

        while (leaf.parentElement) {
          if (leaf.classList.contains(`slate-${type}`)) {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const commentsEntry = api.comment!.node();

            if (!commentsEntry) {
              unsetActiveSuggestion();

              break;
            }

            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const id = api.comment!.nodeId(commentsEntry[0]);

            setOption("activeId", id ?? null);
            isSet = true;

            break;
          }

          leaf = leaf.parentElement;
        }

        if (!isSet) unsetActiveSuggestion();
      },
    },
    options: {
      activeId: null,
      commentingBlock: null,
      hotkey: ["meta+shift+m", "ctrl+shift+m"],
      hoverId: null,
      uniquePathMap: new Map(),
    },
    useHooks: ({ editor, getOptions }) => {
      const { hotkey } = getOptions();
      useHotkeys(
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        hotkey!,
        (e) => {
          if (!editor.selection) return;

          e.preventDefault();

          if (!editor.api.isExpanded()) return;
        },
        {
          enableOnContentEditable: true,
        },
      );
    },
  },
);
