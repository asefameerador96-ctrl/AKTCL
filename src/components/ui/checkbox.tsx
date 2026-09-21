import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";

/**
 * A square hairline box — no radius, no fill until it is ticked. The boundary is
 * --input (3:1), the same rule the text fields are written on.
 *
 * The tick is drawn, not switched: it is always in the DOM (forceMount) and a
 * clip-path wipes it in from the left — the direction a pen makes the stroke —
 * while the box fills with the accent. Unchecking wipes it back out.
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-none border border-input ring-offset-background transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      forceMount
      className="flex items-center justify-center text-current transition-[clip-path] duration-300 ease-expo-out [clip-path:inset(0_0_0_0)] data-[state=unchecked]:[clip-path:inset(0_100%_0_0)]"
    >
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
        <path d="M3 8.4l3.2 3.1L13 4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
