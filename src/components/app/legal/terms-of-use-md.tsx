import { Markdown } from "@/components/chat/markdown";
import fs from "node:fs";
import path from "node:path";

const TermsOfUseMd = async () => {
  const markdownPath = path.join(process.cwd(), "src/md/terms-of-use.md");
  const markdownContent = fs.readFileSync(markdownPath, "utf8");

  return <Markdown>{markdownContent}</Markdown>;
};

export { TermsOfUseMd };
