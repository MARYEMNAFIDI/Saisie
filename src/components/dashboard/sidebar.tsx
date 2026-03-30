"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LogOut,
  Settings2,
  type LucideIcon,
} from "lucide-react";

import { SorecLogo } from "@/components/branding/sorec-logo";
import { cn } from "@/lib/utils";

type SidebarIcon = LucideIcon | "horseBirth";

export type SidebarItem = {
  href: string;
  label: string;
  icon: SidebarIcon;
  active: boolean;
};

const SidebarIconRenderer = ({
  icon,
  active,
}: {
  icon: SidebarIcon;
  active: boolean;
}) => {
  if (icon === "horseBirth") {
    return (
      <Image
        src="/les-chevaux.png"
        alt=""
        aria-hidden
        width={18}
        height={18}
        className={cn(
          "h-[18px] w-[18px] object-contain",
          active ? "brightness-0 invert" : "opacity-80 brightness-0",
        )}
      />
    );
  }

  const Icon = icon;
  return <Icon className="h-[18px] w-[18px]" />;
};

const SidebarLink = ({
  item,
  tone = "default",
}: {
  item: SidebarItem;
  tone?: "default" | "subtle";
}) => (
  <Link
    href={item.href}
    className={cn(
      "flex h-12 items-center rounded-2xl px-3 transition-all duration-200 group-hover/sidebar:justify-start",
      item.active
        ? "bg-slate-950 text-white shadow-[0_18px_34px_-28px_rgba(15,23,42,0.65)]"
        : tone === "subtle"
          ? "text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-[0_16px_30px_-28px_rgba(15,23,42,0.18)]"
          : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-[0_16px_30px_-28px_rgba(15,23,42,0.18)]",
      "justify-center",
    )}
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
      <SidebarIconRenderer icon={item.icon} active={item.active} />
    </span>
    <span className="ml-3 max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-200 group-hover/sidebar:max-w-[140px] group-hover/sidebar:opacity-100">
      {item.label}
    </span>
  </Link>
);

export const Sidebar = ({
  title,
  subtitle,
  primaryItems,
  secondaryItems,
  settingsHref,
  onLogout,
}: {
  title: string;
  subtitle: string;
  primaryItems: SidebarItem[];
  secondaryItems: SidebarItem[];
  settingsHref: string;
  onLogout: () => void;
}) => (
  <div className="group/sidebar sticky top-24 z-20 h-[calc(100vh-7rem)] w-[78px] transition-[width] duration-300 hover:w-[220px]">
    <div className="flex h-full flex-col justify-between rounded-[24px] border border-slate-200/90 bg-[#F8F9FB]/95 p-3 shadow-[0_28px_60px_-36px_rgba(15,23,42,0.18)] backdrop-blur">
      <div className="space-y-6">
        <div className="space-y-4">
          <Link
            href="/"
            className="flex h-12 items-center justify-center rounded-2xl bg-white shadow-[0_14px_30px_-24px_rgba(15,23,42,0.24)] transition-all duration-200 group-hover/sidebar:justify-start group-hover/sidebar:px-3"
          >
            <span className="text-lg font-semibold text-slate-950 group-hover/sidebar:hidden">
              S
            </span>
            <SorecLogo size="sm" className="hidden group-hover/sidebar:inline-flex" />
          </Link>

          <div className="rounded-2xl bg-white/70 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400 group-hover/sidebar:block">
              Workspace
            </p>
            <p className="mt-0 truncate text-sm font-semibold text-slate-900 opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
              {title}
            </p>
            <p className="truncate text-xs text-slate-500 opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
              {subtitle}
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {primaryItems.map((item) => (
            <SidebarLink key={item.href} item={item} />
          ))}
        </nav>

        {secondaryItems.length > 0 ? (
          <div className="space-y-2 border-t border-slate-200 pt-4">
            {secondaryItems.map((item) => (
              <SidebarLink key={item.href} item={item} tone="subtle" />
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-2 border-t border-slate-200 pt-4">
        <Link
          href={settingsHref}
          className="flex h-12 items-center justify-center rounded-2xl text-slate-500 transition-all duration-200 hover:bg-white hover:text-slate-900 hover:shadow-[0_16px_30px_-28px_rgba(15,23,42,0.18)] group-hover/sidebar:justify-start group-hover/sidebar:px-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Settings2 className="h-[18px] w-[18px]" />
          </span>
          <span className="ml-3 max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-200 group-hover/sidebar:max-w-[140px] group-hover/sidebar:opacity-100">
            Paramètres
          </span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-12 w-full items-center justify-center rounded-2xl text-slate-500 transition-all duration-200 hover:bg-white hover:text-slate-900 hover:shadow-[0_16px_30px_-28px_rgba(15,23,42,0.18)] group-hover/sidebar:justify-start group-hover/sidebar:px-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <LogOut className="h-[18px] w-[18px]" />
          </span>
          <span className="ml-3 max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-200 group-hover/sidebar:max-w-[140px] group-hover/sidebar:opacity-100">
            Quitter
          </span>
        </button>
      </div>
    </div>
  </div>
);
