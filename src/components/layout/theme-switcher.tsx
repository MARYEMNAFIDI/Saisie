"use client";

import { Palette } from "lucide-react";

import { AppTheme, useTheme } from "@/components/providers/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const themeLabel: Record<AppTheme, string> = {
  sorec: "Theme SOREC",
  fintech: "Theme Fintech",
  midnight: "Theme Midnight",
};

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-w-[180px]">
      <Select value={theme} onValueChange={(value) => setTheme(value as AppTheme)}>
        <SelectTrigger className="h-9 rounded-full border-border bg-card/90 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Palette className="h-3.5 w-3.5" />
            <SelectValue aria-label={themeLabel[theme]} />
          </div>
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="sorec">Theme SOREC</SelectItem>
          <SelectItem value="fintech">Theme Fintech</SelectItem>
          <SelectItem value="midnight">Theme Midnight</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

