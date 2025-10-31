import type { ToolInvocation } from "ai";
import { Markdown } from "@/components/chat/markdown";

const ToolBlock = ({
  tool,
  toolStream,
}: {
  tool: ToolInvocation;
  toolStream?: string;
}) => {
  return (
    <div key={tool.toolCallId}>
      <div>
        <p>
          {tool.toolName} | {tool.toolCallId}
        </p>
      </div>
      <div className="flex flex-col justify-between">
        <Markdown>
          {tool.state === "result" ? tool.result : (toolStream ?? "")}
        </Markdown>
      </div>
    </div>
  );
};

export { ToolBlock };
