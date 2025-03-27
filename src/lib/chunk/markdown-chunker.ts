// Implementation taken from a PR suggestion on the mastra Discord server.

import llamaTokenizer from "llama-tokenizer-js";

const encoding = llamaTokenizer;

export function countTokens(text: string) {
  return encoding.encode(text).length;
}

interface MarkdownNode {
  title: string;
  depth: number;
  content: string;
  length: number;
}

export function splitMarkdownAtHeaders(markdown: string, joinThreshold = 500) {
  const sections = splitMarkdownByHeaders(markdown);

  const deepest = Math.max(...sections.map((line) => line.depth));

  for (let i = deepest; i > 0; i--) {
    for (let j = 0; j < sections.length; j++) {
      if (sections[j].depth === i && j !== 0) {
        const prev = sections[j - 1];
        //const successor = sections[j + 1];
        if (
          prev.length + sections[j].length < joinThreshold &&
          prev.depth <= sections[j].depth
        ) {
          const title = `${"#".repeat(i)} ${sections[j].title}`;
          prev.content += `\n\n${title}\n${sections[j].content}`;
          prev.length += sections[j].length + countTokens(title);
          sections.splice(j, 1);
          j--;
        }
        /*else if (successor && successor.length + sections[j].length < joinThreshold && successor.depth <= sections[j].depth) {
                    const title = `${'#'.repeat(i)} ${sections[j].title}`
                    successor.content = `${title}\n${sections[j].content}\n${successor.content}`;
                    successor.length += sections[j].length + countTokens(title);
                    sections.splice(j, 1);
                    j--
                }*/
      }
    }
  }

  return sections;
}

function splitMarkdownByHeaders(markdown: string): MarkdownNode[] {
  const sections: MarkdownNode[] = [];
  const lines = markdown.split("\n");
  let currentContent = "";
  let currentTitle = "";
  let currentDepth = 0;
  let inCodeBlock = false;

  const headerRegex = /^(#+)\s+(.+)$/;

  for (const line of lines) {
    const headerMatch = line.match(headerRegex);
    if (line.startsWith("```") || line.startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
    }

    if (headerMatch && !inCodeBlock) {
      if (currentContent.trim() !== "") {
        sections.push({
          title: currentTitle,
          content: currentContent.trim(),
          depth: currentDepth,
          length: countTokens(currentContent.trim()),
        });
        currentContent = "";
      }

      currentDepth = headerMatch[1].length;
      currentTitle = headerMatch[2];
    } else {
      currentContent += `${line}\n`;
    }
  }

  // Add the last section if there's any remaining content
  if (currentContent.trim() !== "") {
    sections.push({
      title: currentTitle,
      content: currentContent.trim(),
      depth: currentDepth,
      length: countTokens(currentContent.trim()),
    });
  }

  //If there was no preamble, and there were headers, remove the initial empty preamble.
  if (
    sections.length > 1 &&
    sections[0].title === "" &&
    sections[0].content.trim() === ""
  ) {
    sections.shift();
  }

  return sections;
}
