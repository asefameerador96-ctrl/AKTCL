import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * The button recipes live in src/index.css (.btn + one tone) so a <Link> can wear them
 * without importing anything: className="btn btn-solid". This file is the same set
 * for real <button>s. One label everywhere — mono, 13px, uppercase, tracked — 2px
 * corners, solid high-contrast fills, 300ms expo-out, and hover only ever changes
 * colour and border. Nothing scales.
 */
const buttonVariants = cva("btn", {
  variants: {
    variant: {
      // Paper: solid black / whitish (white / slate in the dark theme).
      default: "btn-solid",
      // Ink bands and photography: solid white / slate.
      onInk: "btn-ink",
      // A 1px hairline that darkens on hover.
      outline: "btn-outline",
      outlineInk: "btn-outline-ink",
      // No box: the label with a drawn underline.
      link: "btn-link",
    },
    // Nothing under 44px: every size is a touch target first.
    size: {
      default: "",
      lg: "btn-lg",
      icon: "btn-icon",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

// ---- the enquiry form's submit ------------------------------------------------------
// The primary button with its arrow in a ruled-off cell of its own, like a row in a
// directory. On hover or keyboard focus the arrow leaves right as its twin arrives
// from the left (transform only); the fill changes with the rest of its .btn tone.

export interface CtaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the child (a <Link>, an <a>) as the button instead of a <button>. */
  asChild?: boolean;
  /** paper: solid black. ink: solid white, for ink bands and photography. */
  tone?: "paper" | "ink";
  /** Work in progress: a spinner takes the arrow's place and the button stops answering. */
  busy?: boolean;
}

const ARROW = "h-4 w-4 transition-transform duration-300 ease-expo-out";
const ARROW_OUT = "group-hover/cta:translate-x-[260%] group-focus-visible/cta:translate-x-[260%]";
const ARROW_IN =
  "absolute -translate-x-[260%] group-hover/cta:translate-x-0 group-focus-visible/cta:translate-x-0";

const CtaButton = React.forwardRef<HTMLButtonElement, CtaButtonProps>(
  ({ className, asChild = false, tone = "paper", busy = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-busy={busy ? "" : undefined}
        className={cn(
          "btn btn-lg group/cta justify-between gap-0 pl-8 pr-0 md:min-h-14",
          tone === "ink" ? "btn-ink" : "btn-solid",
          // Busy is not "disabled": it keeps its full colour while the request runs.
          busy && "pointer-events-none",
          className,
        )}
        {...props}
      >
        {/* A direct child, or asChild cannot find it. */}
        <Slottable>{children}</Slottable>
        {/* The divider follows the label's colour through every state of the tone. */}
        <span aria-hidden="true" className="ml-8 w-px shrink-0 self-stretch bg-current opacity-20" />
        <span
          aria-hidden="true"
          className="relative flex w-12 shrink-0 items-center justify-center self-stretch overflow-hidden md:w-14"
        >
          {busy ? (
            // A spinner has to turn at a constant rate: the one place `linear` belongs.
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ArrowRight className={cn(ARROW, ARROW_OUT)} />
              <ArrowRight className={cn(ARROW, ARROW_IN)} />
            </>
          )}
        </span>
      </Comp>
    );
  },
);
CtaButton.displayName = "CtaButton";

export { Button, CtaButton };
