"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardCheck,
  FileSpreadsheet,
  FolderOutput,
  GitBranch,
  MapPinned,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { getHarasById } from "@/data/haras";
import { buildDashboardPath, buildWorkspacePath } from "@/lib/navigation";
import { formatDateTime } from "@/lib/utils";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { useSession } from "@/components/providers/session-provider";

import { ProtectedPage } from "@/components/access/protected-page";
import { DetailPanel } from "@/components/dashboard/detail-panel";
import { HeaderFilters } from "@/components/dashboard/header-filters";
import { SectionGroup } from "@/components/dashboard/section-group";
import { DashboardItem } from "@/components/dashboard/types";
import { Button } from "@/components/ui/button";

export default function HarasDashboardPage() {
  const params = useParams<{ harasId: string }>();
  const harasId = params.harasId;

  const haras = getHarasById(harasId);
  const { getScopedSnapshot } = useMockDatabase();
  const { session, can } = useSession();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  if (!haras) {
    return null;
  }

  const scopedCentreId = session.scope === "centre" ? session.centreId : undefined;
  const snapshot = getScopedSnapshot(harasId, scopedCentreId);
  const visibleCentres = scopedCentreId
    ? haras.centres.filter((centre) => centre.id === scopedCentreId)
    : haras.centres;
  const alertCentres = visibleCentres.filter(
    (centre) => centre.pendingReviews >= 4 || centre.status !== "synchronise",
  );
  const dataHref = buildWorkspacePath(harasId, "saisies");
  const exportHref = buildWorkspacePath(harasId, "exports");
  const totalVisibleRows =
    snapshot.mares.length + snapshot.reproductions.length + snapshot.products.length;
  const totalPendingReviews = visibleCentres.reduce(
    (sum, centre) => sum + centre.pendingReviews,
    0,
  );

  const heroMetrics = [
    {
      icon: FileSpreadsheet,
      label: "Base visible",
      value: `${snapshot.mares.length}`,
      hint: "Fiches juments disponibles sur le perimetre actif.",
    },
    {
      icon: GitBranch,
      label: "Suivis",
      value: `${snapshot.reproductions.length}`,
      hint: "Parcours reproduction actuellement consultables.",
    },
    {
      icon: MapPinned,
      label: "Centres couverts",
      value: `${visibleCentres.length}`,
      hint: scopedCentreId
        ? "Lecture centre verrouillee sur votre session."
        : "Couverture visible sur l'ensemble du haras.",
    },
    {
      icon: AlertTriangle,
      label: "Attention",
      value: `${alertCentres.length}`,
      hint:
        alertCentres.length > 0
          ? `${totalPendingReviews} relectures remontees a absorber.`
          : "Aucune derive critique sur le perimetre visible.",
    },
  ];

  const heroTags = [
    `Role ${session.role}`,
    can("export") ? "Export autorise" : "Lecture et saisie",
    scopedCentreId ? "Vue centre verrouillee" : `${visibleCentres.length} centres visibles`,
  ];

  const heroSpotlight =
    alertCentres.length > 0
      ? {
          label: "Point d'attention",
          title: `${alertCentres.length} centre(s) a reprendre`,
          description:
            "Le dashboard met en avant les centres a relire en priorite pour accelerer les corrections, la revalidation et la coordination de campagne.",
          meta: `${totalPendingReviews} relectures ouvertes`,
          tone: "warning" as const,
        }
      : {
          label: "Cadence stable",
          title: "Flux de campagne sous controle",
          description:
            "La saisie, la consultation et les exports restent disponibles sans signal critique. Le focus peut rester sur l'execution metier.",
          meta: `${totalVisibleRows} lignes visibles`,
          tone: "success" as const,
        };

  const dashboardItems = useMemo<DashboardItem[]>(() => {
    const commonTimestamp = formatDateTime(session.lastValidatedAt);

    const operations: DashboardItem[] = [
      {
        id: "mares",
        section: "TODO",
        filterId: "essential",
        title: "Base juments",
        description:
          "Creer, relire et retrouver rapidement les fiches juments actives.",
        badge: `${snapshot.mares.length} fiches`,
        badgeVariant: "info",
        href: buildWorkspacePath(harasId, "juments"),
        meta: [
          { icon: FileSpreadsheet, label: `${snapshot.mares.length} juments visibles` },
          { icon: MapPinned, label: `${visibleCentres.length} centres couverts` },
          { icon: ShieldCheck, label: session.role },
        ],
        detailEyebrow: "Base metier",
        detailTitle: "Gestion des juments",
        detailDescription:
          "Cette vue centralise la creation, la recherche et la mise a jour des fiches juments sur le perimetre actif. Le flux metier reste inchange, seule la lecture gagne en clarte.",
        highlightTitle: "Point d'entree de la campagne",
        highlightText: `${snapshot.mares.length} fiches visibles sur ${visibleCentres.length} centres. Utilisez cette entree pour qualifier la base avant la reproduction.`,
        attachments: [
          {
            id: "mares-view",
            label: "Ouvrir la liste des juments",
            href: buildWorkspacePath(harasId, "juments"),
            downloadHref: can("export") ? exportHref : buildWorkspacePath(harasId, "juments"),
          },
          {
            id: "mares-data",
            label: "Consulter les donnees liees",
            href: `${dataHref}?tab=mares`,
            downloadHref: can("export") ? exportHref : `${dataHref}?tab=mares`,
          },
        ],
        comments: [
          {
            id: "mares-comment-1",
            author: "Session metier",
            role: session.role,
            timestamp: commonTimestamp,
            message:
              "La base juments reste le premier point de controle avant toute nouvelle saisie.",
          },
          {
            id: "mares-comment-2",
            author: "Pilotage haras",
            role: haras.shortName,
            timestamp: `${visibleCentres.length} centres`,
            message:
              "Les fiches visibles sont deja cadrees sur le perimetre actif pour limiter les ecarts de saisie.",
          },
        ],
      },
      {
        id: "reproduction",
        section: "TODO",
        filterId: "essential",
        title: "Suivi reproduction",
        description: "Lancer une saisie complete de reproduction avec la fiche jument.",
        badge: `${snapshot.reproductions.length} suivis`,
        badgeVariant: "default",
        href: buildWorkspacePath(harasId, "reproduction"),
        meta: [
          { icon: GitBranch, label: `${snapshot.reproductions.length} enregistrements` },
          { icon: MapPinned, label: `${visibleCentres.length} centres visibles` },
          { icon: ShieldCheck, label: "Saisie guidee" },
        ],
        detailEyebrow: "Formulaire guide",
        detailTitle: "Reproduction",
        detailDescription:
          "Le flux reproduction conserve sa logique complete pour la jument, l'etalon, les cycles et les constats associes. La refonte porte uniquement sur la lisibilite du pilotage.",
        highlightTitle: "Ecran central de saisie",
        highlightText:
          "Utilisez ce module pour enregistrer les cycles, le diagnostic et le suivi FARAS sans changer le fonctionnement actuel.",
        attachments: [
          {
            id: "reproduction-form",
            label: "Ouvrir le formulaire reproduction",
            href: buildWorkspacePath(harasId, "reproduction"),
            downloadHref: buildWorkspacePath(harasId, "reproduction"),
          },
          {
            id: "reproduction-data",
            label: "Relire les suivis saisis",
            href: `${dataHref}?tab=reproduction`,
            downloadHref: can("export") ? exportHref : `${dataHref}?tab=reproduction`,
          },
        ],
        comments: [
          {
            id: "repro-comment-1",
            author: "Controle qualite",
            role: "Workflow",
            timestamp: commonTimestamp,
            message:
              "Les resultats de cycle et le diagnostic restent regroupes dans la meme chaine de validation.",
          },
          {
            id: "repro-comment-2",
            author: "SOREC",
            role: "Metier",
            timestamp: `${snapshot.reproductions.length} suivis`,
            message:
              "Le formulaire reproduction reste separe de la declaration de naissance pour garder un flux clair.",
          },
        ],
      },
      {
        id: "birth-declaration",
        section: "TODO",
        filterId: "essential",
        title: "Declaration de naissance",
        description: "Acceder au module dedie pour gerer les naissances declarees.",
        badge: `${snapshot.products.length} declarations`,
        badgeVariant: "success",
        href: buildWorkspacePath(harasId, "produits"),
        meta: [
          { icon: ClipboardCheck, label: `${snapshot.products.length} naissances` },
          { icon: MapPinned, label: `${visibleCentres.length} centres suivis` },
          { icon: ShieldCheck, label: "Module dedie" },
        ],
        detailEyebrow: "Naissances",
        detailTitle: "Declaration de naissance",
        detailDescription:
          "La declaration de naissance reste volontairement separee du flux reproduction. Cette separation protege la logique metier et evite les doubles saisies.",
        highlightTitle: "Module autonome",
        highlightText:
          "L'onglet dedie concentre les informations de naissance, d'identification et de statut sans melanger les etapes amont.",
        attachments: [
          {
            id: "birth-form",
            label: "Ouvrir les declarations",
            href: buildWorkspacePath(harasId, "produits"),
            downloadHref: buildWorkspacePath(harasId, "produits"),
          },
          {
            id: "birth-data",
            label: "Consulter l'historique des naissances",
            href: `${dataHref}?tab=produits`,
            downloadHref: can("export") ? exportHref : `${dataHref}?tab=produits`,
          },
        ],
        comments: [
          {
            id: "birth-comment-1",
            author: "Saisie naissance",
            role: "Module",
            timestamp: commonTimestamp,
            message:
              "L'entree reste isolee dans son onglet pour eviter tout melange avec la reproduction.",
          },
          {
            id: "birth-comment-2",
            author: "Pilotage",
            role: haras.shortName,
            timestamp: `${snapshot.products.length} declarations`,
            message:
              "Les declarations visibles refletent uniquement le perimetre autorise de votre session.",
          },
        ],
      },
    ];

    const monitoringBase: DashboardItem[] = [
      {
        id: "data-room",
        section: "IN PROGRESS",
        filterId: "monitoring",
        title: "Vue consolidee",
        description:
          "Parcourir les donnees saisies, filtrer et relire les enregistrements.",
        badge: `${totalVisibleRows} lignes`,
        badgeVariant: "outline",
        href: dataHref,
        meta: [
          { icon: Search, label: "Recherche rapide" },
          { icon: MapPinned, label: `${visibleCentres.length} centres` },
          { icon: ShieldCheck, label: "Lecture transversale" },
        ],
        detailEyebrow: "Controle",
        detailTitle: "Donnees consolidees",
        detailDescription:
          "Cette vue permet de relire juments, reproductions et declarations de naissance dans un seul espace de consultation, sans modifier la structure metier existante.",
        highlightTitle: "Relecture transverse",
        highlightText:
          "Utilisez cette entree pour retrouver un dossier, comparer les enregistrements ou preparer une extraction metier.",
        attachments: [
          {
            id: "data-view",
            label: "Ouvrir la consultation",
            href: dataHref,
            downloadHref: can("export") ? exportHref : dataHref,
          },
          {
            id: "data-fertility",
            label: "Voir l'onglet fertilite",
            href: `${dataHref}?tab=fertilite`,
            downloadHref: can("export") ? exportHref : `${dataHref}?tab=fertilite`,
          },
        ],
        comments: [
          {
            id: "data-comment-1",
            author: "Session",
            role: session.role,
            timestamp: commonTimestamp,
            message:
              "Les filtres de consultation respectent automatiquement le perimetre centre ou haras en cours.",
          },
          {
            id: "data-comment-2",
            author: "Support qualite",
            role: "Lecture",
            timestamp: `${visibleCentres.length} centres`,
            message:
              "La vue consolidee sert de point de controle rapide avant export ou validation finale.",
          },
        ],
      },
    ];

    if (can("export")) {
      monitoringBase.push({
        id: "exports",
        section: "IN PROGRESS",
        filterId: "monitoring",
        title: "Exports metier",
        description:
          "Preparer les sorties et recuperer les bases utiles au suivi de campagne.",
        badge: "Telechargements",
        badgeVariant: "info",
        href: exportHref,
        meta: [
          { icon: FolderOutput, label: "CSV / XLSX" },
          { icon: MapPinned, label: haras.shortName },
          { icon: ShieldCheck, label: "Droits d'export" },
        ],
        detailEyebrow: "Exports",
        detailTitle: "Exports operationnels",
        detailDescription:
          "Les exports conservent les memes regles d'acces. La refonte ne modifie ni le contenu ni les droits, uniquement la lecture de l'espace.",
        highlightTitle: "Sorties pretes a l'usage",
        highlightText:
          "Utilisez cet espace pour recuperer les bases metier sans quitter le workflow du dashboard.",
        attachments: [
          {
            id: "exports-base",
            label: "Ouvrir la page exports",
            href: exportHref,
            downloadHref: exportHref,
          },
          {
            id: "exports-data",
            label: "Relire la vue consolidee",
            href: dataHref,
            downloadHref: exportHref,
          },
        ],
        comments: [
          {
            id: "exports-comment-1",
            author: "Role export",
            role: session.role,
            timestamp: commonTimestamp,
            message:
              "Les sorties disponibles dependent du role actif, sans modifier la source metier en amont.",
          },
          {
            id: "exports-comment-2",
            author: "SOREC",
            role: "Controle",
            timestamp: "Disponibilite active",
            message:
              "Les exports peuvent etre prepares apres relecture des donnees consolidees.",
          },
        ],
      });
    }

    const alertItems: DashboardItem[] =
      alertCentres.length > 0
        ? alertCentres.map((centre) => ({
            id: `alert-${centre.id}`,
            section: "IN PROGRESS",
            filterId: "monitoring",
            title: centre.name,
            description: `${centre.pendingReviews} fiche(s) a revoir avant la prochaine saisie ou validation.`,
            badge: centre.status,
            badgeVariant: centre.status === "prioritaire" ? "danger" : "warning",
            href: buildDashboardPath(harasId, "centre", centre.id),
            meta: [
              { icon: AlertTriangle, label: `${centre.pendingReviews} relectures` },
              { icon: MapPinned, label: centre.region },
              { icon: ShieldCheck, label: centre.manager },
            ],
            detailEyebrow: "Monitoring",
            detailTitle: centre.name,
            detailDescription:
              "Cette alerte met en avant un centre qui necessite une attention particuliere. Le contenu metier n'est pas modifie, seuls les indicateurs sont reordonnes pour une lecture plus rapide.",
            highlightTitle: "Point de vigilance",
            highlightText: `${centre.pendingReviews} element(s) en attente sur ${centre.region}. Une relecture est recommandee avant la prochaine session de saisie.`,
            attachments: [
              {
                id: `${centre.id}-dashboard`,
                label: "Ouvrir le dashboard du centre",
                href: buildDashboardPath(harasId, "centre", centre.id),
                downloadHref: buildDashboardPath(harasId, "centre", centre.id),
              },
              {
                id: `${centre.id}-data`,
                label: "Consulter les donnees du haras",
                href: dataHref,
                downloadHref: can("export") ? exportHref : dataHref,
              },
            ],
            comments: [
              {
                id: `${centre.id}-comment-1`,
                author: centre.manager,
                role: "Responsable centre",
                timestamp: centre.status,
                message:
                  "Le centre reste visible dans le perimetre actuel pour faciliter la relance et la relecture des dossiers.",
              },
              {
                id: `${centre.id}-comment-2`,
                author: "Pilotage haras",
                role: haras.shortName,
                timestamp: commonTimestamp,
                message:
                  "Cette alerte provient des indicateurs de relecture et de synchronisation deja presents dans les donnees.",
              },
            ],
          }))
        : [
            {
              id: "calm-flow",
              section: "IN PROGRESS",
              filterId: "monitoring",
              title: "Flux stabilise",
              description:
                "Aucun centre prioritaire ni demande urgente de relecture sur le perimetre visible.",
              badge: "Stable",
              badgeVariant: "success",
              href: dataHref,
              meta: [
                { icon: ShieldCheck, label: "Aucune alerte critique" },
                { icon: MapPinned, label: `${visibleCentres.length} centres suivis` },
                { icon: Search, label: "Controle disponible" },
              ],
              detailEyebrow: "Monitoring",
              detailTitle: "Surveillance maitrisee",
              detailDescription:
                "Le tableau de bord ne remonte aucun point critique sur les centres visibles. Les modules de consultation et d'export restent accessibles pour des verifications complementaires.",
              highlightTitle: "Cadence lisible",
              highlightText:
                "Le flux est stable sur le perimetre actuel. Vous pouvez poursuivre la saisie ou ouvrir la consultation pour un controle cible.",
              attachments: [
                {
                  id: "calm-data",
                  label: "Ouvrir la consultation",
                  href: dataHref,
                  downloadHref: can("export") ? exportHref : dataHref,
                },
                {
                  id: "calm-repro",
                  label: "Revenir a la reproduction",
                  href: buildWorkspacePath(harasId, "reproduction"),
                  downloadHref: buildWorkspacePath(harasId, "reproduction"),
                },
              ],
              comments: [
                {
                  id: "calm-comment-1",
                  author: "Systeme",
                  role: "Monitoring",
                  timestamp: commonTimestamp,
                  message:
                    "Aucun centre ne depasse actuellement le seuil critique de relecture ou de synchronisation.",
                },
                {
                  id: "calm-comment-2",
                  author: "Pilotage",
                  role: haras.shortName,
                  timestamp: `${visibleCentres.length} centres`,
                  message:
                    "La vigilance reste disponible via la consultation consolidee et les exports si necessaire.",
                },
              ],
            },
          ];

    return [...operations, ...monitoringBase, ...alertItems];
  }, [
    alertCentres,
    can,
    dataHref,
    exportHref,
    haras.shortName,
    harasId,
    session.lastValidatedAt,
    session.role,
    snapshot.mares.length,
    snapshot.products.length,
    snapshot.reproductions.length,
    totalVisibleRows,
    visibleCentres.length,
  ]);

  const filters = useMemo(
    () => [
      { id: "all", label: "Vue complete", count: `${dashboardItems.length}` },
      {
        id: "essential",
        label: "Modules",
        count: `${dashboardItems.filter((item) => item.filterId === "essential").length}`,
      },
      {
        id: "monitoring",
        label: "Pilotage",
        count: `${dashboardItems.filter((item) => item.filterId === "monitoring").length}`,
      },
    ],
    [dashboardItems],
  );

  const filteredItems = useMemo(
    () =>
      activeFilter === "all"
        ? dashboardItems
        : dashboardItems.filter((item) => item.filterId === activeFilter),
    [activeFilter, dashboardItems],
  );

  useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedItemId(null);
      return;
    }

    if (!filteredItems.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(filteredItems[0].id);
    }
  }, [filteredItems, selectedItemId]);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedItemId) ?? filteredItems[0] ?? null;

  const sections = [
    {
      id: "todo",
      eyebrow: "Execution",
      label: "Modules prioritaires",
      description:
        "Les points d'entree qui lancent la campagne, la qualification des fiches et les actions metier du quotidien.",
      items: filteredItems.filter((item) => item.section === "TODO"),
    },
    {
      id: "in-progress",
      eyebrow: "Pilotage",
      label: "Surveillance et lecture transverse",
      description:
        "Les vues de controle, les alertes de centres et les points de consultation qui soutiennent la decision.",
      items: filteredItems.filter((item) => item.section === "IN PROGRESS"),
    },
  ];

  const handleShare = () => {
    if (!selectedItem || typeof window === "undefined") {
      return;
    }

    const shareUrl = `${window.location.origin}${selectedItem.href}`;
    void navigator.clipboard.writeText(shareUrl);
    toast.success("Lien copie", {
      description: `Le raccourci vers ${selectedItem.title} a ete copie.`,
    });
  };

  return (
    <ProtectedPage harasId={harasId}>
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-6">
          <HeaderFilters
            eyebrow={scopedCentreId ? "Centre focus" : "Haras executive board"}
            title={`Pilotage ${haras.shortName}`}
            description="Une lecture plus premium pour piloter la saisie, hierarchiser les modules et surveiller les centres sans toucher au flux metier existant."
            status={scopedCentreId ? "Perimetre centre" : haras.stats.status}
            filters={filters}
            activeFilter={activeFilter}
            onChange={setActiveFilter}
            tags={heroTags}
            metrics={heroMetrics}
            spotlight={heroSpotlight}
            coverImage={haras.coverImage}
            actions={
              <>
                <Button asChild>
                  <Link href={buildWorkspacePath(harasId, "juments")}>
                    <ArrowUpRight className="h-4 w-4" />
                    Ouvrir les juments
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={dataHref}>Vue consolidee</Link>
                </Button>
                {can("export") ? (
                  <Button asChild variant="outline">
                    <Link href={exportHref}>Exporter</Link>
                  </Button>
                ) : null}
              </>
            }
          />

          <div className="space-y-10">
            {sections.map((section) => (
              <SectionGroup
                key={section.id}
                eyebrow={section.eyebrow}
                label={section.label}
                description={section.description}
                items={section.items}
                selectedId={selectedItem?.id}
                onSelect={setSelectedItemId}
              />
            ))}
          </div>
        </div>

        <DetailPanel
          item={selectedItem}
          onShare={handleShare}
          onClear={() => setSelectedItemId(null)}
        />
      </div>
    </ProtectedPage>
  );
}
