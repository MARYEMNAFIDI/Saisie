"use client";

import Image from "next/image";
import { Sparkles, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { DashboardFilter } from "@/components/dashboard/types";

export type DashboardHeroMetric = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
};

export type DashboardHeroSpotlight = {
  label: string;
  title: string;
  description: string;
  meta?: string;
  tone?: "default" | "warning" | "success";
};

const spotlightToneClasses = {
  default: "from-white via-slate-50 to-sky-50/90",
  warning: "from-amber-50 via-white to-orange-50/90",
  success: "from-emerald-50 via-white to-cyan-50/90",
} as const;

export const HeaderFilters = ({
  title,
  description,
  filters,
  activeFilter,
  onChange,
  actions,
  eyebrow = "Workspace",
  status,
  tags = [],
  metrics = [],
  spotlight,
  coverImage,
}: {
  title: string;
  description: string;
  filters: DashboardFilter[];
  activeFilter: string;
  onChange: (filterId: string) => void;
  actions?: React.ReactNode;
  eyebrow?: string;
  status?: string;
  tags?: string[];
  metrics?: DashboardHeroMetric[];
  spotlight?: DashboardHeroSpotlight;
  coverImage?: string;
}) => (
  <div className="space-y-6">
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,248,252,0.96))] text-slate-950 shadow-[0_34px_80px_-48px_rgba(15,23,42,0.2)]">
      {coverImage ? (
        <div className="absolute inset-0">
          <Image
            src={coverImage}
            alt=""
            fill
            className="object-cover opacity-16"
            sizes="(max-width: 1280px) 100vw, 1200px"
            priority
          />
        </div>
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(243,247,252,0.88)_50%,rgba(255,248,235,0.92))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.66),transparent_24%),radial-gradient(circle_at_85%_15%,rgba(251,191,36,0.16),transparent_18%),radial-gradient(circle_at_100%_100%,rgba(125,211,252,0.14),transparent_24%)]" />

      <div
        className={cn(
          "relative grid gap-8 p-6 lg:p-8",
          spotlight ? "xl:grid-cols-[minmax(0,1.15fr)_360px]" : "",
        )}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              {eyebrow}
            </span>
            {status ? (
              <span className="inline-flex items-center rounded-full border border-amber-200/70 bg-amber-50/90 px-4 py-1.5 text-sm text-amber-900/75">
                {status}
              </span>
            ) : null}
          </div>

          <div className="max-w-4xl space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] lg:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-500 lg:text-base">
              {description}
            </p>
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200/80 bg-white/82 px-3 py-1.5 text-xs font-medium text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {spotlight ? (
          <div
            className={cn(
              "rounded-[1.75rem] border border-white/70 bg-gradient-to-br p-5 shadow-[0_20px_44px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl",
              spotlightToneClasses[spotlight.tone ?? "default"],
            )}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              <Sparkles className="h-3.5 w-3.5" />
              {spotlight.label}
            </div>

            <div className="mt-8 space-y-4">
              {spotlight.meta ? (
                <p className="text-sm font-medium text-slate-500">{spotlight.meta}</p>
              ) : null}
              <h2 className="text-2xl font-semibold leading-tight">{spotlight.title}</h2>
              <p className="text-sm leading-7 text-slate-500">{spotlight.description}</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>

    {metrics.length > 0 ? (
      <div
        className={cn(
          "grid gap-4 md:grid-cols-2",
          metrics.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-3",
        )}
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="group relative overflow-hidden rounded-[1.65rem] border border-white/70 bg-white/74 p-5 shadow-soft backdrop-blur-xl"
            >
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                    {metric.value}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 shadow-[0_16px_32px_-24px_rgba(180,83,9,0.45)] transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 max-w-[24ch] text-sm leading-6 text-slate-500">
                {metric.hint}
              </p>
            </div>
          );
        })}
      </div>
    ) : null}

    <div className="rounded-[1.6rem] border border-white/70 bg-white/74 p-3 shadow-soft backdrop-blur-xl">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = filter.id === activeFilter;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange(filter.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "border border-amber-200 bg-amber-50 text-amber-950 shadow-[0_16px_30px_-24px_rgba(180,83,9,0.22)]"
                  : "border border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-950",
              )}
            >
              <span>{filter.label}</span>
              {filter.count ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    isActive ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-500",
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
  </div>
);
