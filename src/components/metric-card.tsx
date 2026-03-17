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
      "group relative overflow-hidden border-slate-200/80 bg-slate-50/80 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1",
      className,
    )}
  >
    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
    <CardContent className="relative p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_16px_32px_-20px_rgba(15,23,42,0.9)] transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 max-w-[22ch] text-sm leading-6 text-muted-foreground">
        {hint}
      </p>
    </CardContent>
  </Card>
);
