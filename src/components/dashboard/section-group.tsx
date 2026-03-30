"use client";

import { CardItem } from "@/components/dashboard/card-item";
import { DashboardItem } from "@/components/dashboard/types";

export const SectionGroup = ({
  label,
  items,
  selectedId,
  onSelect,
}: {
  label: string;
  items: DashboardItem[];
  selectedId?: string | null;
  onSelect: (itemId: string) => void;
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
        {label}
      </p>
      <div className="space-y-4">
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
