"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AppTheme = "sorec" | "fintech" | "midnight";
export type DisplayScale = "75" | "90" | "100";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  scale: DisplayScale;
  setScale: (scale: DisplayScale) => void;
};

const THEME_STORAGE_KEY = "sorec-ui-theme";
const SCALE_STORAGE_KEY = "sorec-ui-scale";
const DEFAULT_THEME: AppTheme = "sorec";
const DEFAULT_SCALE: DisplayScale = "100";

const scaleFactorMap: Record<DisplayScale, string> = {
  "75": "0.75",
  "90": "0.9",
  "100": "1",
};

const isTheme = (value: string): value is AppTheme =>
  value === "sorec" || value === "fintech" || value === "midnight";
const isScale = (value: string): value is DisplayScale =>
  value === "75" || value === "90" || value === "100";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_THEME);
  const [scale, setScale] = useState<DisplayScale>(DEFAULT_SCALE);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const storedScale = window.localStorage.getItem(SCALE_STORAGE_KEY);

    if (storedTheme && isTheme(storedTheme)) {
      setTheme(storedTheme);
    }

    if (storedScale && isScale(storedScale)) {
      setScale(storedScale);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(SCALE_STORAGE_KEY, scale);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "midnight");
    document.documentElement.style.colorScheme =
      theme === "midnight" ? "dark" : "light";
    document.documentElement.style.setProperty("--app-scale", scaleFactorMap[scale]);
  }, [scale, theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, scale, setScale }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};
