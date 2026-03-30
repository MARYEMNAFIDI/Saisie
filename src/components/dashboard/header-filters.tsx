"use client";

import { cn } from "@/lib/utils";

import { DashboardFilter } from "@/components/dashboard/types";

export const HeaderFilters = ({
  title,
  description,
  filters,
  activeFilter,
  onChange,
  actions,
}: {
  title: string;
  description: string;
  filters: DashboardFilter[];
  activeFilter: string;
  onChange: (filterId: string) => void;
  actions?: React.ReactNode;
}) => (
  <div className="space-y-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl space-y-3">
        <p className="section-caption">Workspace</p>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-500 lg:text-base">
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>

    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = filter.id === activeFilter;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-slate-950 text-white shadow-[0_16px_32px_-24px_rgba(15,23,42,0.8)]"
                : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <span>{filter.label}</span>
            {filter.count ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  isActive ? "bg-white/14 text-white" : "bg-slate-100 text-slate-500",
                )}
              >
                {filter.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  </div>
);
