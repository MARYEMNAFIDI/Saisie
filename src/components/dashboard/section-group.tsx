"use client";

import { CardItem } from "@/components/dashboard/card-item";
import { DashboardItem } from "@/components/dashboard/types";

export const SectionGroup = ({
  eyebrow,
  label,
  description,
  items,
  selectedId,
  onSelect,
}: {
  eyebrow?: string;
  label: string;
  description?: string;
  items: DashboardItem[];
  selectedId?: string | null;
  onSelect: (itemId: string) => void;
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="section-caption">{eyebrow ?? "Section"}</p>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              {label}
            </h2>
            {description ? (
              <p className="max-w-2xl text-sm leading-7 text-slate-500">{description}</p>
            ) : null}
          </div>
        </div>

        <div className="inline-flex w-fit items-center rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-500 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.14)]">
          {items.length} module{items.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <CardItem
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </div>
    </section>
  );
};
