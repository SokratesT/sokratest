import { Markdown } from "@/app/app/chat/_components/markdown";
import type { ToolInvocation } from "ai";

interface Annotation {
  name: string;
  similarity: number;
  text: string;
  fileId: string;
}

const ToolBlock = ({
  tool,
  toolStream,
}: { tool: ToolInvocation; toolStream?: string }) => {
  return (
    <div>
      <div>
        <p>
          {tool.toolName} | {tool.toolCallId}
        </p>
      </div>
      <div className="flex flex-col justify-between">
        <p className="font-bold">Result</p>
        <Markdown>
          {tool.state === "result" ? tool.result : (toolStream ?? "")}
        </Markdown>
      </div>
    </div>
  );
};

export { ToolBlock };
