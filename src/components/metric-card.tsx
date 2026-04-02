import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  className?: string;
}) => (
  <Card
    className={cn(
      "group relative overflow-hidden border-border/70 bg-card/78 transition-transform duration-300 hover:-translate-y-1 dark:bg-card/92",
      className,
    )}
  >
    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
    <CardContent className="relative p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_18px_36px_-22px_rgba(15,23,42,0.84)] transition-transform duration-300 group-hover:scale-105 dark:shadow-[0_18px_36px_-22px_rgba(2,6,23,0.82)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 max-w-[24ch] text-sm leading-6 text-muted-foreground">{hint}</p>
    </CardContent>
  </Card>
);
