"use client";

import { withRef, withVariants } from "@udecode/cn";
import { PlateElement } from "@udecode/plate/react";
import { cva } from "class-variance-authority";

const headingVariants = cva("relative mb-1", {
  variants: {
    variant: {
      h1: "mt-[1.6em] pb-1 font-bold font-heading text-4xl",
      h2: "mt-[1.4em] pb-px font-heading font-semibold text-2xl tracking-tight",
      h3: "mt-[1em] pb-px font-heading font-semibold text-xl tracking-tight",
      h4: "mt-[0.75em] font-heading font-semibold text-lg tracking-tight",
      h5: "mt-[0.75em] font-semibold text-lg tracking-tight",
      h6: "mt-[0.75em] font-semibold text-base tracking-tight",
    },
  },
});

const HeadingElementVariants = withVariants(PlateElement, headingVariants, [
  "variant",
]);

export const HeadingElement = withRef<typeof HeadingElementVariants>(
  ({ children, variant = "h1", ...props }, ref) => {
    return (
      <HeadingElementVariants
        ref={ref}
        // biome-ignore lint/style/noNonNullAssertion: <Needs refactor, but fine for now>
        as={variant!}
        variant={variant}
        {...props}
      >
        {children}
      </HeadingElementVariants>
    );
  },
);
