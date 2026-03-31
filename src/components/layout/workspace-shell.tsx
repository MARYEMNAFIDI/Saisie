"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  Download,
  Home,
  Search,
  TableProperties,
} from "lucide-react";
import { toast } from "sonner";

import { getCentreById, getHarasById } from "@/data/haras";
import { buildAccessPath, buildWorkspacePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/providers/session-provider";

import { Sidebar, type SidebarItem } from "@/components/dashboard/sidebar";

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
  const isCentreWorkspace = Boolean(currentCentre);
  const maresHref = buildWorkspacePath(harasId, "juments");
  const reproductionHref = buildWorkspacePath(harasId, "reproduction");
  const productsHref = buildWorkspacePath(harasId, "produits");
  const dataHref = buildWorkspacePath(harasId, "saisies");
  const fertilityHref = `${dataHref}?tab=fertilite`;
  const exportsHref = buildWorkspacePath(harasId, "exports");

  const primaryNavItems: SidebarItem[] = isCentreWorkspace
    ? [
        {
          href: dashboardHref,
          label: "Accueil CRE",
          description: "Vue simple des actions du jour",
          icon: Home,
          active: pathname === dashboardHref,
        },
        {
          href: maresHref,
          label: "1. Trouver une jument",
          description: "Rechercher ou relire une fiche",
          icon: Search,
          active: isActiveLink(pathname, maresHref),
        },
        {
          href: reproductionHref,
          label: "2. Saisir la reproduction",
          description: "Enregistrer la saillie et le suivi",
          icon: BarChart3,
          active: isActiveLink(pathname, reproductionHref),
        },
        {
          href: productsHref,
          label: "3. Declarer une naissance",
          description: "Ajouter le produit et son statut",
          icon: "horseBirth",
          active: isActiveLink(pathname, productsHref),
        },
        {
          href: dataHref,
          label: "4. Verifier les donnees",
          description: "Controler avant validation",
          icon: TableProperties,
          active: pathname === dataHref && activeDataTab !== "fertilite",
        },
      ]
    : [
        {
          href: dashboardHref,
          label: "Accueil",
          description: "Vue d'ensemble du haras",
          icon: Home,
          active: pathname === dashboardHref,
        },
        {
          href: maresHref,
          label: "Juments",
          description: "Base de fiches du perimetre",
          icon: Search,
          active: isActiveLink(pathname, maresHref),
        },
        {
          href: reproductionHref,
          label: "Reproduction",
          description: "Saisies et suivis",
          icon: BarChart3,
          active: isActiveLink(pathname, reproductionHref),
        },
        {
          href: productsHref,
          label: "Naissances",
          description: "Declarations de produits",
          icon: "horseBirth",
          active: isActiveLink(pathname, productsHref),
        },
      ];

  const secondaryNavItems: SidebarItem[] = [
    ...(isCentreWorkspace
      ? [
          {
            href: fertilityHref,
            label: "Indicateurs",
            description: "Fertilite et lecture globale",
            icon: Activity,
            active: pathname === dataHref && activeDataTab === "fertilite",
          },
        ]
      : [
          {
            href: dataHref,
            label: "Donnees",
            description: "Vue consolidee",
            icon: TableProperties,
            active: pathname === dataHref && activeDataTab !== "fertilite",
          },
          {
            href: fertilityHref,
            label: "Fertilite",
            description: "Indices de campagne",
            icon: Activity,
            active: pathname === dataHref && activeDataTab === "fertilite",
          },
        ]),
    ...(can("export")
      ? [
          {
            href: exportsHref,
            label: "Exports",
            description: "Telechargements metier",
            icon: Download,
            active: isActiveLink(pathname, exportsHref),
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
    toast.message("Session effacee", {
      description: "Le perimetre d'acces simule a ete reinitialise cote front.",
    });
  };

  const scopeLabel = currentCentre ? currentCentre.name : haras.name;
  const statusLabel = currentCentre ? currentCentre.status : haras.stats.status;

  return (
    <div className="min-h-screen">
      <div className="container py-4 lg:py-6">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="relative hidden lg:block">
            <Sidebar
              title={isCentreWorkspace ? "Espace CRE" : haras.shortName}
              subtitle={
                isCentreWorkspace ? `${scopeLabel} | ${haras.shortName}` : scopeLabel
              }
              primaryItems={primaryNavItems}
              secondaryItems={secondaryNavItems}
              settingsHref={accessLink}
              onLogout={handleLogout}
              coverImage={haras.coverImage}
              statusLabel={
                !isCentreWorkspace && typeof statusLabel === "string"
                  ? statusLabel
                  : undefined
              }
              roleLabel={!isCentreWorkspace ? session.role : undefined}
            />
          </aside>

          <main className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {[...primaryNavItems, ...secondaryNavItems].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                    item.active
                      ? "border border-amber-200 bg-amber-50 text-amber-950 dark:border-sky-400/30 dark:bg-sky-400/12 dark:text-sky-100"
                      : "border border-slate-200 bg-white/85 text-slate-600 hover:bg-white dark:border-slate-800 dark:bg-slate-900/78 dark:text-slate-300 dark:hover:bg-slate-900",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
