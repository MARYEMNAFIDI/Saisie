import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border bg-card/70 px-6 py-12 text-center shadow-soft dark:bg-card/88 dark:shadow-[0_22px_55px_-36px_rgba(2,6,23,0.82)]",
      className,
    )}
  >
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="text-2xl font-semibold">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
      {description}
    </p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);
