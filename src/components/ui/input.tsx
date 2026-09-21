import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The ruled-line field every control on the site shares (input, textarea and the
 * enquiry form's native select): no box, a 1px rule to write on. `peer` lets the
 * <FieldRule> that follows it answer to focus and to aria-invalid. 16px text on
 * phones, so iOS does not zoom the page on focus.
 */
export const FIELD =
  "peer block w-full rounded-none border-0 border-b border-input bg-transparent px-0 text-base text-foreground ring-offset-background transition-colors duration-300 ease-quart-out placeholder:text-muted-foreground/70 hover:border-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]";

/**
 * The second, heavier rule that is drawn over a field's hairline from the left when
 * the field takes focus, and stays — in the error colour — while the field is
 * invalid. Place it straight after the control, inside a `relative` wrapper.
 * A transform, so the field never changes height.
 */
const FieldRule = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-700 ease-expo-out peer-focus-visible:scale-x-100 peer-aria-[invalid=true]:scale-x-100 peer-aria-[invalid=true]:bg-destructive"
  />
);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative">
        <input type={type} className={cn(FIELD, "h-12", className)} ref={ref} {...props} />
        <FieldRule />
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input, FieldRule };
