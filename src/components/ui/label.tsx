import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The site's mono label (the .eyebrow recipe): 13px, uppercase, tracked, muted — the
// counterweight to the display serif. Spelled out rather than `mono-label` so a
// className given to one label (the consent sentence) can still override it through
// cn(). It turns to the accent while its field has focus; the FormItem (or any
// wrapper) carries `group`.
const labelVariants = cva(
  "block font-mono text-[13px] font-medium uppercase leading-normal tracking-[0.15em] text-muted-foreground transition-colors group-focus-within:text-accent peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
