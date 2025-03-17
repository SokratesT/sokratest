import { Markdown } from "@/components/chat/markdown";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface RagResult {
  fileId: string;
  text: string;
  similarity: number;
}

const RagResult = ({ tool }: { tool: ToolInvocation }) => {
  if (tool.state === "result") {
    /* const cleanToolResult = tool.result.replace(/\\/g, "");
    console.log(cleanToolResult); */

    // TODO: Add fallback from improperly formatted JSON
    const ragResult = JSON.parse(tool.result) as RagResult[];
    return (
      <div className="flex gap-2">
        {ragResult.map((r, i) => (
          <Popover key={`${r.fileId}${r.similarity}`}>
            <PopoverTrigger asChild>
              <Button>Ref. {i + 1}</Button>
            </PopoverTrigger>
            <PopoverContent className="h-72 w-[500px]">
              <ScrollArea className="size-full">
                <p>{r.fileId}</p>
                <p>{r.similarity}</p>
                <p className="mt-2">{r.text}</p>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p>Searching RAG...</p>
    </div>
  );
};

export { ToolBlock };
