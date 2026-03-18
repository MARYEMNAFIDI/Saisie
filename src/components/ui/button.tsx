import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_20px_40px_-24px_rgba(15,23,42,0.9)] hover:-translate-y-0.5 hover:bg-primary/94",
        secondary:
          "border border-border bg-secondary/85 text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur hover:bg-secondary",
        outline:
          "border border-border bg-card/70 text-foreground backdrop-blur hover:border-ring/60 hover:bg-muted/80",
        ghost: "text-foreground hover:bg-muted/70",
        accent:
          "bg-accent text-accent-foreground shadow-[0_18px_36px_-24px_rgba(8,145,178,0.85)] hover:-translate-y-0.5 hover:bg-accent/92",
        danger:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-6 text-base",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
