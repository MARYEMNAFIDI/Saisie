import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[1.25rem] bg-muted/70", className)}
      {...props}
    />
  );
}

export { Skeleton };
