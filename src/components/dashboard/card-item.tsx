"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { DashboardItem } from "@/components/dashboard/types";

export const CardItem = ({
  item,
  selected,
  onSelect,
}: {
  item: DashboardItem;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "w-full rounded-[1.35rem] bg-white p-5 text-left shadow-[0_18px_40px_-30px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-28px_rgba(15,23,42,0.2)]",
      selected ? "ring-2 ring-slate-900/8 shadow-[0_22px_54px_-28px_rgba(15,23,42,0.24)]" : "",
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
        <p className="text-sm leading-7 text-slate-500">{item.description}</p>
      </div>
      <Badge variant={item.badgeVariant}>{item.badge}</Badge>
    </div>

    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
      {item.meta.map((meta) => {
        const Icon = meta.icon;

        return (
          <span key={`${item.id}-${meta.label}`} className="inline-flex items-center gap-2">
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </span>
        );
      })}
    </div>
  </button>
);
