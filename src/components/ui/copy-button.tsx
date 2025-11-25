"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "value" | "onClick"> {
  /** The value to copy - can be a string or a function that returns a string */
  value: string | (() => string);
  /** Optional label to show next to the icon */
  showLabel?: boolean;
  /** Tooltip text shown on hover */
  tooltipText?: string;
  /** Toast messages for copy states */
  toastMessages?: {
    loading?: string;
    success?: string;
    error?: string;
  };
  /** Whether to show toast notifications */
  showToast?: boolean;
}

const CopyButton = ({
  value,
  showLabel = false,
  tooltipText = "Copy to clipboard",
  toastMessages = {
    loading: "Copying...",
    success: "Copied!",
    error: "Failed to copy",
  },
  showToast = true,
  ...props
}: CopyButtonProps) => {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      const timeout = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [hasCopied]);

  const handleCopy = async () => {
    const textToCopy = typeof value === "function" ? value() : value;

    try {
      if (showToast) {
        await toast.promise(navigator.clipboard.writeText(textToCopy), {
          loading: toastMessages.loading,
          success: toastMessages.success,
          error: toastMessages.error,
        });
      } else {
        await navigator.clipboard.writeText(textToCopy);
      }
      setHasCopied(true);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const button = (
    <Button onClick={handleCopy} {...props}>
      <span className="sr-only">Copy</span>
      {hasCopied ? (
        <CheckIcon className="size-3" />
      ) : (
        <CopyIcon className="size-3" />
      )}
      {showLabel && (
        <span className="ml-1">{hasCopied ? "Copied" : "Copy"}</span>
      )}
    </Button>
  );

  if (tooltipText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{hasCopied ? "Copied!" : tooltipText}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

export { CopyButton };
