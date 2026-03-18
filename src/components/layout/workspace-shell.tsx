"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  Baby,
  ChevronRight,
  Download,
  Home,
  LogOut,
  MapPinned,
  ShieldCheck,
  TableProperties,
} from "lucide-react";
import { toast } from "sonner";

import { getCentreById, getHarasById } from "@/data/haras";
import { buildAccessPath, buildWorkspacePath } from "@/lib/navigation";
import { formatDateTime } from "@/lib/utils";
import { useSession } from "@/components/providers/session-provider";

import { SorecLogo } from "@/components/branding/sorec-logo";
import { RoleBadge } from "@/components/role-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const isActiveLink = (pathname: string, href: string) =>
  href.endsWith("/dashboard") ? pathname === href : pathname.startsWith(href);

export const WorkspaceShell = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ harasId: string; centreId?: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session, can, logout } = useSession();

  const harasId = params.harasId;
  const routeCentreId =
    typeof params.centreId === "string" ? params.centreId : undefined;

  const haras = getHarasById(harasId);
  const currentCentre =
    (routeCentreId ? getCentreById(routeCentreId) : undefined) ||
    (session.centreId ? getCentreById(session.centreId) : undefined);

  if (!haras) {
    return <div className="container py-12">Haras introuvable.</div>;
  }

  const dashboardHref = routeCentreId
    ? `/haras/${harasId}/centres/${routeCentreId}/dashboard`
    : session.scope === "centre" && currentCentre
      ? `/haras/${harasId}/centres/${currentCentre.id}/dashboard`
      : `/haras/${harasId}/dashboard`;

  const activeDataTab = searchParams.get("tab");

  const primaryNavItems = [
    { href: dashboardHref, label: "Accueil", icon: Home },
    {
      href: buildWorkspacePath(harasId, "reproduction"),
      label: "Reproduction",
      icon: BarChart3,
    },
    {
      href: buildWorkspacePath(harasId, "produits"),
      label: "Production",
      icon: Baby,
    },
    {
      href: `${buildWorkspacePath(harasId, "saisies")}?tab=fertilite`,
      label: "Fertilite",
      icon: Activity,
    },
  ];

  const secondaryNavItems = [
    {
      href: buildWorkspacePath(harasId, "saisies"),
      label: "Données",
      icon: TableProperties,
    },
    ...(can("export")
      ? [
          {
            href: buildWorkspacePath(harasId, "exports"),
            label: "Exports",
            icon: Download,
          },
        ]
      : []),
    // Seul le super_admin peut accéder au contrôle de session/role
  ];

  const accessLink = buildAccessPath(
    harasId,
    routeCentreId ? "centre" : session.scope === "centre" ? "centre" : "haras",
    routeCentreId ?? currentCentre?.id,
  );

  const handleLogout = () => {
    logout();
    toast.message("Session effacee", {
      description: "Le perimetre d'acces simule a ete reinitialise cote front.",
    });
  };

  return (
    <div className="min-h-screen">
      <div className="container py-4 lg:py-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div className="hero-panel overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${haras.palette.from} ${haras.palette.via} ${haras.palette.to} opacity-[0.97]`}
                />
                <div className="relative space-y-6 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <Link href="/">
                      <SorecLogo tone="light" size="sm" />
                    </Link>
                    <ShieldCheck className="h-5 w-5 text-white/80" />
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold leading-tight text-white">
                      Bienvenue au {haras.name}
                    </h1>
                    <p className="text-sm leading-6 text-white/75">
                      {currentCentre ? `Centre : ${currentCentre.name}` : "Tous les centres"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="surface-card p-4">
                <div className="mb-3 px-2">
                  <p className="section-caption">Essentiel</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Les actions utiles au quotidien.
                  </p>
                </div>
                <nav className="space-y-2">
                  {primaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isFertilityLink = item.label === "Fertilite";
                    const isDataPath = pathname === buildWorkspacePath(harasId, "saisies");
                    const isActive = isFertilityLink
                      ? isDataPath && activeDataTab === "fertilite"
                      : isActiveLink(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between rounded-[1.15rem] px-4 py-3 text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-[linear-gradient(135deg,hsl(var(--primary)),rgba(8,145,178,0.94))] text-primary-foreground shadow-[0_18px_32px_-24px_rgba(15,23,42,0.95)]"
                            : "text-slate-700 hover:bg-slate-900/5"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-5 border-t border-slate-200/70 pt-4">
                  <div className="px-2">
                    <p className="section-caption">Plus</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Consultation, export et reglages.
                    </p>
                  </div>
                  <nav className="mt-3 space-y-2">
                    {secondaryNavItems.map((item) => {
                      const Icon = item.icon;
                      const isDataPath = pathname === buildWorkspacePath(harasId, "saisies");
                      const isActive =
                        item.label === "DonnÃ©es"
                          ? isDataPath && activeDataTab !== "fertilite"
                          : isActiveLink(pathname, item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between rounded-[1.15rem] px-4 py-3 text-sm font-semibold transition-colors ${
                            isActive
                              ? "bg-[linear-gradient(135deg,hsl(var(--primary)),rgba(8,145,178,0.94))] text-primary-foreground shadow-[0_18px_32px_-24px_rgba(15,23,42,0.95)]"
                              : "text-slate-700 hover:bg-slate-900/5"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </span>
                          <ChevronRight className="h-4 w-4 opacity-70" />
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>

              <div className="surface-card p-5">
                <p className="section-caption">Session</p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p>
                    <span className="font-semibold text-slate-900">Derniere validation:</span>{" "}
                    {formatDateTime(session.lastValidatedAt)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Perimetre:</span>{" "}
                    {session.scope === "centre" && currentCentre
                      ? currentCentre.name
                      : haras.name}
                  </p>
                </div>
                <div className="mt-5 flex gap-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href={accessLink}>Changer l'acces</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Quitter
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <div className="surface-card flex flex-col gap-4 p-5 lg:hidden">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <SorecLogo size="sm" />
                  <p className="section-caption">Essentiel</p>
                </div>
                <RoleBadge role={session.role} />
              </div>
              <div className="-mx-1 overflow-x-auto">
                <nav className="flex min-w-max gap-2 px-1 pb-1">
                  {primaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isFertilityLink = item.label === "Fertilite";
                    const isDataPath = pathname === buildWorkspacePath(harasId, "saisies");
                    const isActive = isFertilityLink
                      ? isDataPath && activeDataTab === "fertilite"
                      : isActiveLink(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                          isActive
                            ? "bg-[linear-gradient(135deg,hsl(var(--primary)),rgba(8,145,178,0.94))] text-primary-foreground"
                            : "bg-white/70 text-slate-700"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex flex-wrap gap-2">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isDataPath = pathname === buildWorkspacePath(harasId, "saisies");
                  const isActive =
                    item.label === "DonnÃ©es"
                      ? isDataPath && activeDataTab !== "fertilite"
                      : isActiveLink(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                        isActive
                          ? "bg-slate-950 text-white"
                          : "bg-white/70 text-slate-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="surface-card flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPinned className="h-4 w-4 text-primary" />
                <span>
                  {currentCentre
                    ? `Centre actif: ${currentCentre.name}`
                    : "Vue consolidee du haras"}
                </span>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <Badge variant="outline">{haras.stats.centreCount} centres</Badge>
                <Badge variant="outline">{haras.stats.activeForms} formulaires</Badge>
              </div>
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
