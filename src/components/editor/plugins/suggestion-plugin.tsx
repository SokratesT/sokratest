"use client";

import {
  type ExtendConfig,
  isSlateEditor,
  isSlateElement,
  isSlateString,
  type Path,
} from "@udecode/plate";
import { toTPlatePlugin } from "@udecode/plate/react";
import {
  type BaseSuggestionConfig,
  BaseSuggestionPlugin,
} from "@udecode/plate-suggestion";

import { BlockSuggestion } from "@/components/plate-ui/block-suggestion";

export type SuggestionConfig = ExtendConfig<
  BaseSuggestionConfig,
  {
    activeId: string | null;
    currentUserId: string;
    hoverId: string | null;
    uniquePathMap: Map<string, Path>;
  }
>;

export const suggestionPlugin = toTPlatePlugin<SuggestionConfig>(
  BaseSuggestionPlugin,
  {
    handlers: {
      // unset active suggestion when clicking outside of suggestion
      onClick: ({ api, event, setOption, type }) => {
        let leaf = event.target as HTMLElement;
        let isSet = false;

        const unsetActiveSuggestion = () => {
          setOption("activeId", null);
          isSet = true;
        };

        if (!isSlateString(leaf)) unsetActiveSuggestion();

        while (
          leaf.parentElement &&
          !isSlateElement(leaf.parentElement) &&
          !isSlateEditor(leaf.parentElement)
        ) {
          if (leaf.classList.contains(`slate-${type}`)) {
            // biome-ignore lint/style/noNonNullAssertion: <Needs refactor, but fine for now>
            const suggestionEntry = api.suggestion!.node({
              isText: true,
            });

            if (!suggestionEntry) {
              unsetActiveSuggestion();

              break;
            }

            // biome-ignore lint/style/noNonNullAssertion: <Needs refactor, but fine for now>
            const id = api.suggestion!.nodeId(suggestionEntry[0]);

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
      currentUserId: "user3",
      hoverId: null,
      uniquePathMap: new Map(),
    },
    render: {
      belowRootNodes: ({ api, element }) => {
        // biome-ignore lint/style/noNonNullAssertion: <Needs refactor, but fine for now>
        if (!api.suggestion!.isBlockSuggestion(element)) {
          return null;
        }

        return <BlockSuggestion element={element} />;
      },
    },
  },
);
