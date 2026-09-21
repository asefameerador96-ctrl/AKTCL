import * as React from "react";

import { cn } from "@/lib/utils";
import { FIELD, FieldRule } from "@/components/ui/input";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Ruled like writing paper: a hairline under every 2rem line of text, drawn as a
 * repeating background that scrolls with the content (bg-local). The field's own
 * bottom border is dropped — the last ruled line is that border.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <div className="relative">
      <textarea
        className={cn(
          FIELD,
          "min-h-[8rem] resize-y border-b-0 bg-gradient-to-b from-transparent from-[calc(100%-1px)] to-input to-[calc(100%-1px)] bg-[length:100%_2rem] bg-local py-0 leading-[2rem]",
          className,
        )}
        ref={ref}
        {...props}
      />
      <FieldRule />
    </div>
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
