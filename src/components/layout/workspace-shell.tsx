"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  Download,
  Home,
  MapPinned,
  ShieldCheck,
  TableProperties,
} from "lucide-react";
import { toast } from "sonner";

import { getCentreById, getHarasById } from "@/data/haras";
import { buildAccessPath, buildWorkspacePath } from "@/lib/navigation";
import { useSession } from "@/components/providers/session-provider";

import { Sidebar, type SidebarItem } from "@/components/dashboard/sidebar";
import { SorecLogo } from "@/components/branding/sorec-logo";
import { RoleBadge } from "@/components/role-badge";
import { Badge } from "@/components/ui/badge";

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

  const primaryNavItems: SidebarItem[] = [
    {
      href: dashboardHref,
      label: "Accueil",
      icon: Home,
      active: pathname === dashboardHref,
    },
    {
      href: buildWorkspacePath(harasId, "reproduction"),
      label: "Reproduction",
      icon: BarChart3,
      active: isActiveLink(pathname, buildWorkspacePath(harasId, "reproduction")),
    },
    {
      href: buildWorkspacePath(harasId, "produits"),
      label: "Déclaration de naissance",
      icon: "horseBirth",
      active: isActiveLink(pathname, buildWorkspacePath(harasId, "produits")),
    },
    {
      href: `${buildWorkspacePath(harasId, "saisies")}?tab=fertilite`,
      label: "Fertilité",
      icon: Activity,
      active:
        pathname === buildWorkspacePath(harasId, "saisies") &&
        activeDataTab === "fertilite",
    },
  ];

  const secondaryNavItems: SidebarItem[] = [
    {
      href: buildWorkspacePath(harasId, "saisies"),
      label: "Données",
      icon: TableProperties,
      active:
        pathname === buildWorkspacePath(harasId, "saisies") &&
        activeDataTab !== "fertilite",
    },
    ...(can("export")
      ? [
          {
            href: buildWorkspacePath(harasId, "exports"),
            label: "Exports",
            icon: Download,
            active: isActiveLink(pathname, buildWorkspacePath(harasId, "exports")),
          },
        ]
      : []),
  ];

  const accessLink = buildAccessPath(
    harasId,
    routeCentreId ? "centre" : session.scope === "centre" ? "centre" : "haras",
    routeCentreId ?? currentCentre?.id,
  );

  const handleLogout = () => {
    logout();
    toast.message("Session effacée", {
      description: "Le périmètre d'accès simulé a été réinitialisé côté front.",
    });
  };

  const scopeLabel = currentCentre ? currentCentre.name : haras.name;

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <div className="container py-4 lg:py-6">
        <div className="grid gap-6 lg:grid-cols-[96px_minmax(0,1fr)]">
          <aside className="relative hidden lg:block">
            <Sidebar
              title={haras.shortName}
              subtitle={scopeLabel}
              primaryItems={primaryNavItems}
              secondaryItems={secondaryNavItems}
              settingsHref={accessLink}
              onLogout={handleLogout}
            />
          </aside>

          <main className="space-y-6">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_-34px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <SorecLogo size="sm" />
                  <p className="section-caption">Workspace</p>
                </div>
                <RoleBadge role={session.role} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[...primaryNavItems, ...secondaryNavItems].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_-34px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <MapPinned className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                      Périmètre actif
                    </p>
                    <p className="font-medium text-slate-950">{scopeLabel}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="info" className="gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {session.role}
                  </Badge>
                </div>
              </div>
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
