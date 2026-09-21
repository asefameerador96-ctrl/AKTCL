import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors duration-300 ease-quart-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Nothing under 44px: every size is a touch target first.
      size: {
        default: "h-11 px-5",
        sm: "h-11 px-4 text-[13px]",
        lg: "h-12 px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

// ---- the site's one primary call to action ----------------------------------------
// A pill whose arrow rides on a disc. The disc is not an element: it is the flood
// layer, clipped to a circle. On hover, keyboard focus or press the circle opens
// until the colour fills the pill, and the arrow leaves right as its twin arrives
// from the left. Clip-path and transform only, so it never touches layout.

// --disc (radius) and --disc-x (centre, from the right edge) are set on the pill so
// the circle always sits exactly under the arrow box, at either size.
const FLOOD_SHAPES = {
  "--rest": "circle(var(--disc) at calc(100% - var(--disc-x)) 50%)",
  "--flooded": "circle(150% at calc(100% - var(--disc-x)) 50%)",
} as React.CSSProperties;

const PILL_TONE = {
  // Always-dark bands: outlined at rest, gold floods it.
  ink: {
    pill: "border-gold/60 text-ink-foreground hover:text-ink focus-visible:text-ink focus-visible:ring-gold focus-visible:ring-offset-ink active:text-ink data-[busy]:text-ink",
    flood: "bg-gold",
    arrow: "text-ink",
  },
  // Themed surfaces: solid accent at rest, the page's ink floods it. Both pairs
  // (accent / accent-foreground, foreground / background) hold AA in either theme.
  paper: {
    pill: "border-accent bg-accent text-accent-foreground",
    flood: "bg-foreground",
    arrow: "text-background",
  },
} as const;

export interface CtaPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the child (a <Link>, an <a>) as the pill instead of a <button>. */
  asChild?: boolean;
  tone?: keyof typeof PILL_TONE;
  /** Work in progress: the pill stays flooded and a spinner takes the arrow's place. */
  busy?: boolean;
}

const ARROW = "h-4 w-4 transition-transform duration-500 ease-expo-out";

const CtaPill = React.forwardRef<HTMLButtonElement, CtaPillProps>(
  ({ className, asChild = false, tone = "paper", busy = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const colours = PILL_TONE[tone];
    return (
      <Comp
        ref={ref}
        data-busy={busy ? "" : undefined}
        className={cn(
          "group/pill relative isolate inline-flex min-h-14 items-center justify-between gap-5 overflow-hidden rounded-full border pl-7 pr-1.5 font-sans text-[13px] font-semibold uppercase tracking-[0.18em] transition-colors duration-500 ease-expo-out [--disc-x:1.75rem] [--disc:1.375rem] disabled:pointer-events-none md:min-h-16 md:pl-9 md:pr-2 md:[--disc-x:2rem] md:[--disc:1.5rem] [&:disabled:not([data-busy])]:opacity-50",
          colours.pill,
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 -z-10 transition-[clip-path] duration-700 ease-expo-out [clip-path:var(--rest)]",
            "group-hover/pill:[clip-path:var(--flooded)] group-focus-visible/pill:[clip-path:var(--flooded)] group-active/pill:[clip-path:var(--flooded)] group-data-[busy]/pill:[clip-path:var(--flooded)]",
            colours.flood,
          )}
          style={FLOOD_SHAPES}
        />
        <Slottable>{children}</Slottable>
        <span
          aria-hidden="true"
          className={cn(
            "relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full md:h-12 md:w-12",
            colours.arrow,
          )}
        >
          {busy ? (
            // A spinner has to turn at a constant rate: the one place `linear` belongs.
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ArrowRight className={cn(ARROW, "group-hover/pill:translate-x-[240%] group-focus-visible/pill:translate-x-[240%]")} />
              <ArrowRight
                className={cn(
                  ARROW,
                  "absolute -translate-x-[240%] group-hover/pill:translate-x-0 group-focus-visible/pill:translate-x-0",
                )}
              />
            </>
          )}
        </span>
      </Comp>
    );
  },
);
CtaPill.displayName = "CtaPill";

export { Button, CtaPill };
