import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The site's quiet small-caps label, the counterweight to the display serif. It warms
// to the accent while its field has focus — the FormItem (or any wrapper) carries `group`.
const labelVariants = cva(
  "block font-sans text-[11px] font-semibold uppercase leading-none tracking-[0.2em] text-muted-foreground transition-colors duration-300 ease-quart-out group-focus-within:text-accent peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
