"use client";

import { AppWindow } from "lucide-react";

import { DisplayScale, useTheme } from "@/components/providers/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const scaleLabel: Record<DisplayScale, string> = {
  "75": "75%",
  "90": "90%",
  "100": "100%",
};

export const DisplayScaleSwitcher = () => {
  const { scale, setScale } = useTheme();

  return (
    <div className="min-w-[120px]">
      <Select value={scale} onValueChange={(value) => setScale(value as DisplayScale)}>
        <SelectTrigger className="h-9 rounded-full border-border bg-card/90 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AppWindow className="h-3.5 w-3.5" />
            <SelectValue aria-label={`Taille ${scaleLabel[scale]}`} />
          </div>
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="75">75%</SelectItem>
          <SelectItem value="90">90%</SelectItem>
          <SelectItem value="100">100%</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

