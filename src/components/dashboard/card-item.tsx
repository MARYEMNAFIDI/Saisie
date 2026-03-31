"use client";

import { ArrowUpRight } from "lucide-react";

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
    aria-pressed={selected}
    className={cn(
      "group relative w-full overflow-hidden rounded-[1.75rem] border p-5 text-left transition-all duration-300 sm:p-6",
      selected
        ? "border-slate-900/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(244,247,251,0.92))] shadow-[0_28px_60px_-34px_rgba(15,23,42,0.24)]"
        : "border-white/70 bg-white/74 shadow-[0_20px_46px_-34px_rgba(15,23,42,0.18)] hover:-translate-y-1 hover:border-slate-200/90 hover:bg-white/86 hover:shadow-[0_28px_60px_-32px_rgba(15,23,42,0.22)]",
    )}
  >
    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.badgeVariant}>{item.badge}</Badge>
          <span className="text-xs font-medium text-slate-400">
            {selected ? "Selection active" : "Cliquer pour afficher le detail"}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            {item.title}
          </h3>
          <p className="max-w-2xl text-sm leading-7 text-slate-500">{item.description}</p>
        </div>
      </div>

      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300",
          selected
            ? "bg-amber-100 text-amber-900 shadow-[0_16px_32px_-24px_rgba(180,83,9,0.28)]"
            : "bg-slate-100 text-slate-600 group-hover:scale-105 group-hover:bg-amber-100 group-hover:text-amber-900",
        )}
      >
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </div>

    <div className="mt-5 flex flex-wrap gap-2">
      {item.meta.map((meta) => {
        const Icon = meta.icon;

        return (
          <span
            key={`${item.id}-${meta.label}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/78 px-3 py-1.5 text-xs font-medium text-slate-500"
          >
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </span>
        );
      })}
    </div>
  </button>
);
