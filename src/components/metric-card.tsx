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
      "group relative overflow-hidden border-white/70 bg-white/76 transition-transform duration-300 hover:-translate-y-1",
      className,
    )}
  >
    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
    <CardContent className="relative p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            {label}
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_36px_-22px_rgba(15,23,42,0.84)] transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 max-w-[24ch] text-sm leading-6 text-slate-500">{hint}</p>
    </CardContent>
  </Card>
);
