import { ParagraphPlugin } from "@udecode/plate/react";

export const defaultEditorText = [
  {
    children: [{ text: "The start of something great..." }],
    type: "h1",
  },
  {
    children: [
      { text: "A rich-text editor with AI capabilities. Try the " },
      { bold: true, text: "AI commands" },
      { text: " or type " },
      { kbd: true, text: "/" },
      {
        text: " to access the quick menu for headings, lists, and other formatting options.",
      },
    ],
    type: ParagraphPlugin.key,
  },
];
