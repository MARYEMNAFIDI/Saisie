import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean;
  }
>(({ className, required = false, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-semibold leading-none text-foreground/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-200",
      className,
    )}
    {...props}
  >
    <span className="inline-flex items-center gap-1">
      <span>{children}</span>
      {required ? (
        <>
          <span aria-hidden="true" className="text-xs font-bold text-rose-600">
            *
          </span>
          <span className="sr-only">obligatoire</span>
        </>
      ) : null}
    </span>
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
