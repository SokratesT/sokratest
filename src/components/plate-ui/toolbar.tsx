"use client";

import * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import { cn, withCn, withRef, withVariants } from "@udecode/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { Separator } from "./separator";
import { withTooltip } from "./tooltip";

export const Toolbar = withCn(
  ToolbarPrimitive.Root,
  "relative flex items-center select-none",
);

export const ToolbarToggleGroup = withCn(
  ToolbarPrimitive.ToolbarToggleGroup,
  "flex items-center",
);

export const ToolbarLink = withCn(
  ToolbarPrimitive.Link,
  "font-medium underline underline-offset-4",
);

export const ToolbarSeparator = withCn(
  ToolbarPrimitive.Separator,
  "mx-2 my-1 w-px shrink-0 bg-border",
);

const toolbarButtonVariants = cva(
  cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-foreground text-sm transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg:not([data-icon])]:size-4",
  ),
  {
    defaultVariants: {
      size: "sm",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-3",
        lg: "h-11 px-5",
        sm: "h-7 px-2",
      },
      variant: {
        default:
          "bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
    },
  },
);

const dropdownArrowVariants = cva(
  cn(
    "inline-flex items-center justify-center rounded-r-md font-medium text-foreground text-sm transition-colors disabled:pointer-events-none disabled:opacity-50",
  ),
  {
    defaultVariants: {
      size: "sm",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 w-6",
        lg: "h-11 w-8",
        sm: "h-7 w-4",
      },
      variant: {
        default:
          "bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground",
        outline:
          "border border-input border-l-0 bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
    },
  },
);

type ToolbarButtonProps = {
  isDropdown?: boolean;
  pressed?: boolean;
  size?: VariantProps<typeof toolbarButtonVariants>["size"];
  variant?: VariantProps<typeof toolbarButtonVariants>["variant"];
} & Omit<
  React.ComponentPropsWithRef<typeof ToolbarPrimitive.Button>,
  "asChild" | "value"
>;

const ToolbarButtonBase = ({
  children,
  className,
  isDropdown,
  pressed,
  size,
  variant,
  ...props
}: ToolbarButtonProps) => {
  const buttonContent = isDropdown ? (
    <>
      <div className="flex flex-1 items-center gap-2 whitespace-nowrap">
        {children}
      </div>
      <div>
        <ChevronDown className="size-3.5 text-muted-foreground" data-icon />
      </div>
    </>
  ) : (
    children
  );

  const buttonClassName = cn(
    toolbarButtonVariants({
      size,
      variant,
    }),
    isDropdown && "justify-between gap-1 pr-1",
    className,
  );

  if (typeof pressed === "boolean") {
    return (
      <ToolbarPrimitive.ToggleGroup
        disabled={props.disabled}
        value="single"
        type="single"
      >
        <ToolbarPrimitive.ToggleItem
          className={buttonClassName}
          value={pressed ? "single" : ""}
          {...props}
        >
          {buttonContent}
        </ToolbarPrimitive.ToggleItem>
      </ToolbarPrimitive.ToggleGroup>
    );
  }

  return (
    <ToolbarPrimitive.Button className={buttonClassName} {...props}>
      {buttonContent}
    </ToolbarPrimitive.Button>
  );
};

const ToolbarButton = withTooltip(ToolbarButtonBase);

export { ToolbarButton };

export const ToolbarSplitButton = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ToolbarButton>) => {
  return (
    <ToolbarButton
      className={cn("group flex gap-0 px-0 hover:bg-transparent", className)}
      {...props}
    >
      {children}
    </ToolbarButton>
  );
};

export const ToolbarSplitButtonPrimaryBase = ({
  children,
  className,
  size,
  variant,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof ToolbarToggleItem>, "value">) => {
  return (
    <span
      className={cn(
        toolbarButtonVariants({
          size,
          variant,
        }),
        "rounded-r-none",
        "group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const ToolbarSplitButtonPrimary = withTooltip(
  ToolbarSplitButtonPrimaryBase,
);

export const ToolbarSplitButtonSecondary = ({
  className,
  size,
  variant,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof ToolbarToggleItem>, "value"> &
  VariantProps<typeof dropdownArrowVariants>) => {
  return (
    <span
      className={cn(
        dropdownArrowVariants({
          size,
          variant,
        }),
        "group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      role="button"
      {...props}
    >
      <ChevronDown className="size-3.5 text-muted-foreground" data-icon />
    </span>
  );
};

ToolbarSplitButton.displayName = "ToolbarButton";

export const ToolbarToggleItem = withVariants(
  ToolbarPrimitive.ToggleItem,
  toolbarButtonVariants,
  ["variant", "size"],
);

export const ToolbarGroup = withRef<"div">(({ children, className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "group/toolbar-group",
        "relative hidden has-[button]:flex",
        className,
      )}
    >
      <div className="flex items-center">{children}</div>

      <div className="group-last/toolbar-group:hidden! mx-1.5 py-0.5">
        <Separator orientation="vertical" />
      </div>
    </div>
  );
});
