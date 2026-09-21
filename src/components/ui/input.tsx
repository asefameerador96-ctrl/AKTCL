import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The ruled-line field every control on the site shares (input, textarea and the
 * enquiry form's native select): no box, no fill, no radius — a 1px rule to write on,
 * in --input so the control's one boundary still clears 3:1. `peer` lets the
 * <FieldRule> that follows it answer to focus and to aria-invalid. Keyboard focus also
 * gets the site's 2px ring, held 4px off so it frames the field instead of crowding
 * the text. 17px, the site's body size: the typed answer reads as easily as the copy
 * around it (and at 16px or more iOS does not zoom the page on focus).
 */
export const FIELD =
  "peer block w-full rounded-none border-0 border-b border-input bg-transparent px-0 font-sans text-[17px] text-foreground ring-offset-background transition-colors placeholder:text-muted-foreground hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * The second, heavier rule drawn over a field's hairline from the left when the field
 * takes focus — the accent's one moment in the form — and held, in the error colour,
 * while the field is invalid. Place it straight after the control, inside a `relative`
 * wrapper. A transform, so the field never changes height.
 */
const FieldRule = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-expo-out peer-focus-visible:scale-x-100 peer-aria-[invalid=true]:scale-x-100 peer-aria-[invalid=true]:bg-destructive"
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
