"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LogOut, Settings2, type LucideIcon } from "lucide-react";

import { SorecLogo } from "@/components/branding/sorec-logo";
import { cn } from "@/lib/utils";

type SidebarIcon = LucideIcon | "horseBirth";

export type SidebarItem = {
  href: string;
  label: string;
  description?: string;
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
          active
            ? "opacity-90 brightness-0 dark:brightness-0 dark:invert"
            : "opacity-80 brightness-0 dark:brightness-0 dark:invert",
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
      "group flex items-center gap-3 rounded-[1.35rem] border px-4 py-3 transition-all duration-200",
      item.active
        ? "border-amber-200 bg-amber-50 text-amber-950 shadow-[0_18px_38px_-28px_rgba(180,83,9,0.18)] dark:border-sky-400/40 dark:bg-[linear-gradient(135deg,rgba(30,41,59,0.98),rgba(15,23,42,0.96))] dark:text-slate-50 dark:shadow-[0_18px_38px_-28px_rgba(56,189,248,0.32)]"
        : tone === "subtle"
          ? "border-transparent bg-transparent text-slate-500 hover:border-white/70 hover:bg-white/82 hover:text-slate-950 dark:text-slate-400 dark:hover:border-slate-800 dark:hover:bg-slate-900/80 dark:hover:text-slate-100"
          : "border-transparent bg-white/55 text-slate-600 hover:border-white/70 hover:bg-white hover:text-slate-950 dark:bg-slate-950/55 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-slate-100",
    )}
  >
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
        item.active
          ? "bg-white text-amber-900 dark:border dark:border-sky-400/25 dark:bg-slate-950/96 dark:text-sky-300"
          : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300",
      )}
    >
      <SidebarIconRenderer icon={item.icon} active={item.active} />
    </span>

    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-semibold">{item.label}</span>
      <span
        className={cn(
          "block text-xs",
          item.active
            ? "text-amber-900/60 dark:text-slate-200/78"
            : "text-slate-400 dark:text-slate-500",
        )}
      >
        {item.description ?? "Acces direct"}
      </span>
    </span>

    <ArrowRight
      className={cn(
        "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
        item.active
          ? "text-amber-900/60 dark:text-slate-200/82"
          : "text-slate-300 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-300",
      )}
    />
  </Link>
);

export const Sidebar = ({
  title,
  subtitle,
  primaryItems,
  secondaryItems,
  settingsHref,
  onLogout,
  coverImage,
  statusLabel,
  roleLabel,
}: {
  title: string;
  subtitle: string;
  primaryItems: SidebarItem[];
  secondaryItems: SidebarItem[];
  settingsHref: string;
  onLogout: () => void;
  coverImage?: string;
  statusLabel?: string;
  roleLabel?: string;
}) => {
  const hasCoverImage = Boolean(coverImage);

  return (
    <div className="sticky top-24 z-20 space-y-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-[2rem] p-5",
          hasCoverImage
            ? "border border-white/10 bg-slate-950 text-white shadow-[0_32px_76px_-48px_rgba(2,6,23,0.78)]"
            : "border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,248,252,0.96))] text-slate-950 shadow-[0_32px_76px_-48px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.92))] dark:text-slate-50 dark:shadow-[0_32px_76px_-48px_rgba(2,6,23,0.84)]",
        )}
      >
      {coverImage ? (
        <div className="absolute inset-0">
          <Image
            src={coverImage}
            alt=""
            fill
            className="object-cover opacity-50"
            sizes="320px"
          />
        </div>
      ) : null}
      <div
        className={cn(
          "absolute inset-0",
          hasCoverImage
            ? "bg-[linear-gradient(180deg,rgba(0,0,0,0.44),rgba(0,0,0,0.66)_54%,rgba(0,0,0,0.78))]"
            : "bg-[linear-gradient(155deg,rgba(255,255,255,0.82),rgba(243,247,252,0.9)_48%,rgba(255,247,237,0.9))] dark:bg-[linear-gradient(155deg,rgba(15,23,42,0.12),rgba(15,23,42,0.08)_48%,rgba(56,189,248,0.08))]",
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          hasCoverImage
            ? "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(255,255,255,0.06),transparent_18%),radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.04),transparent_22%)]"
            : "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.68),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(251,191,36,0.14),transparent_18%),radial-gradient(circle_at_100%_100%,rgba(125,211,252,0.12),transparent_22%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(56,189,248,0.14),transparent_18%),radial-gradient(circle_at_100%_100%,rgba(245,158,11,0.08),transparent_22%)]",
        )}
      />

      <div className="relative space-y-6">
        <Link href="/" className="inline-flex">
          <SorecLogo size="sm" tone={hasCoverImage ? "light" : "dark"} />
        </Link>

        <div className="space-y-2">
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.3em]",
              hasCoverImage ? "text-white/60" : "text-slate-400 dark:text-slate-500",
            )}
          >
            Workspace
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p
            className={cn(
              "text-sm leading-6",
              hasCoverImage ? "text-white/82" : "text-slate-500 dark:text-slate-400",
            )}
          >
            {subtitle}
          </p>
        </div>

        {statusLabel || roleLabel ? (
          <div className="grid gap-3">
            {statusLabel ? (
              <div
                className={cn(
                  "rounded-[1.35rem] p-3 backdrop-blur-xl",
                  hasCoverImage
                    ? "border border-white/10 bg-black/32 shadow-none"
                    : "border border-white/70 bg-white/84 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none",
                )}
              >
                <p
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.24em]",
                    hasCoverImage ? "text-white/52" : "text-slate-400 dark:text-slate-500",
                  )}
                >
                  Statut
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm font-medium",
                    hasCoverImage ? "text-white" : "text-slate-700 dark:text-slate-100",
                  )}
                >
                  {statusLabel}
                </p>
              </div>
            ) : null}

            {roleLabel ? (
              <div
                className={cn(
                  "rounded-[1.35rem] p-3 backdrop-blur-xl",
                  hasCoverImage
                    ? "border border-white/10 bg-black/32 shadow-none"
                    : "border border-white/70 bg-white/84 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none",
                )}
              >
                <p
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.24em]",
                    hasCoverImage ? "text-white/52" : "text-slate-400 dark:text-slate-500",
                  )}
                >
                  Role actif
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm font-medium",
                    hasCoverImage ? "text-white" : "text-slate-700 dark:text-slate-100",
                  )}
                >
                  {roleLabel}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/76 p-4 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/72 dark:shadow-[0_22px_55px_-36px_rgba(2,6,23,0.82)]">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="section-caption">Modules</p>
            <nav className="space-y-2">
              {primaryItems.map((item) => (
                <SidebarLink key={item.href} item={item} />
              ))}
            </nav>
          </div>

          {secondaryItems.length > 0 ? (
            <div className="space-y-2 border-t border-slate-200/80 pt-4 dark:border-slate-800">
              <p className="section-caption">Pilotage</p>
              <div className="space-y-2">
                {secondaryItems.map((item) => (
                  <SidebarLink key={item.href} item={item} tone="subtle" />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/76 p-4 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/72 dark:shadow-[0_22px_55px_-36px_rgba(2,6,23,0.82)]">
        <div className="space-y-2">
          <p className="section-caption">Systeme</p>
          <Link
            href={settingsHref}
            className="group flex items-center gap-3 rounded-[1.35rem] border border-transparent bg-white/55 px-4 py-3 text-slate-600 transition-all duration-200 hover:border-white/70 hover:bg-white hover:text-slate-950 dark:bg-slate-950/55 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <Settings2 className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">Parametres</span>
              <span className="block text-xs text-slate-400 dark:text-slate-500">
                Acces et configuration
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-300" />
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="group flex w-full items-center gap-3 rounded-[1.35rem] border border-transparent bg-white/55 px-4 py-3 text-left text-slate-600 transition-all duration-200 hover:border-white/70 hover:bg-white hover:text-slate-950 dark:bg-slate-950/55 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <LogOut className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">Quitter</span>
              <span className="block text-xs text-slate-400 dark:text-slate-500">
                Reinitialiser la session
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
