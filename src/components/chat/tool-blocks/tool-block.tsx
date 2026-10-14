import { type DynamicToolUIPart, getToolName, type ToolUIPart } from "ai";
import { Markdown } from "@/components/chat/markdown";

const ToolBlock = ({
  tool,
  toolStream,
}: {
  tool: ToolUIPart | DynamicToolUIPart;
  toolStream?: string;
}) => {
  const output =
    tool.state === "output-available"
      ? typeof tool.output === "string"
        ? tool.output
        : JSON.stringify(tool.output)
      : (toolStream ?? "");

  return (
    <div key={tool.toolCallId}>
      <div>
        <p>
          {getToolName(tool)} | {tool.toolCallId}
        </p>
      </div>
      <div className="flex flex-col justify-between">
        <Markdown>{output}</Markdown>
      </div>
    </div>
  );
};

export { ToolBlock };
