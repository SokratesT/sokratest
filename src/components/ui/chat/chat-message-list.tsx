import { Button } from "@/components/ui/button";
import { useAutoScroll } from "@/components/ui/chat/hooks/useAutoScroll";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import * as React from "react";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, smooth = false, ...props }, _ref) => {
    const {
      scrollRef,
      isAtBottom,
      autoScrollEnabled,
      scrollToBottom,
      disableAutoScroll,
    } = useAutoScroll({
      smooth,
      content: children,
    });

    return (
      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-y-auto",
          className,
        )}
      >
        <div
          className="flex h-full w-full flex-col overflow-y-auto p-4 pb-0"
          ref={scrollRef}
          onWheel={disableAutoScroll}
          onTouchMove={disableAutoScroll}
          {...props}
        >
          <div className="mx-auto flex w-full max-w-[800px] flex-col gap-6">
            {children}
          </div>
        </div>

        {!isAtBottom && (
          <>
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t from-background to-transparent" />
            <Button
              onClick={scrollToBottom}
              size="icon"
              variant="outline"
              className="-translate-x-1/2 absolute bottom-4 left-1/2 z-10 inline-flex h-10 w-10 transform rounded-full shadow-md"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      /* {!isAtBottom && (
          <Button
            onClick={() => {
              scrollToBottom();
            }}
            size="icon"
            variant="outline"
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )} */
    );
  },
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
