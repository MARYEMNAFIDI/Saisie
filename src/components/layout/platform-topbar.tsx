"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ShieldCheck } from "lucide-react";

import { buildDashboardPath } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/providers/session-provider";

import { DisplayScaleSwitcher } from "@/components/layout/display-scale-switcher";
import { SorecLogo } from "@/components/branding/sorec-logo";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { Button } from "@/components/ui/button";

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === href : pathname.startsWith(href);

export const PlatformTopbar = () => {
  const pathname = usePathname();
  const { session } = useSession();
  const isAdminRoute = pathname.startsWith("/admin");

  const workspaceHref =
    session.status === "granted" && session.harasId
      ? buildDashboardPath(session.harasId, session.scope ?? "haras", session.centreId)
      : null;
  const modeHref = isAdminRoute ? workspaceHref ?? "/" : "/admin";
  const ModeIcon = isAdminRoute ? LayoutGrid : ShieldCheck;
  const modeLabel = isAdminRoute ? "Mode haras" : "Mode admin";

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--topbar-border)] bg-[var(--topbar-bg)] backdrop-blur-xl">
      <div className="container py-4">
        <div className="surface-card flex items-center justify-between gap-4 px-4 py-3 lg:px-5">
          <Link href="/" className="flex shrink-0 items-center">
            <SorecLogo size="sm" />
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                isActive(pathname, "/")
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-primary/10 hover:text-foreground",
              )}
            >
              Accueil
            </Link>
            {workspaceHref ? (
              <Link
                href={workspaceHref}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  pathname.startsWith("/haras/") && !pathname.startsWith("/admin")
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-primary/10 hover:text-foreground",
                )}
              >
                Mon espace
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <DisplayScaleSwitcher />
            {workspaceHref && !isAdminRoute ? (
              <Button
                asChild
                variant={
                  pathname.startsWith("/haras/") && !pathname.startsWith("/admin")
                    ? "secondary"
                    : "outline"
                }
                size="sm"
              >
                <Link href={workspaceHref}>
                  <LayoutGrid className="h-4 w-4" />
                  Plateforme
                </Link>
              </Button>
            ) : null}
            <Button
              asChild
              variant={isAdminRoute ? "default" : "outline"}
              size="sm"
            >
              <Link href={modeHref}>
                <ModeIcon className="h-4 w-4" />
                {modeLabel}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
