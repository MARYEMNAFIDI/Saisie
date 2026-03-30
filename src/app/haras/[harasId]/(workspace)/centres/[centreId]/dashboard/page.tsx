"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ClipboardCheck,
  FileSpreadsheet,
  GitBranch,
  MapPinned,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { getCentreById, getHarasById } from "@/data/haras";
import { buildWorkspacePath } from "@/lib/navigation";
import { formatDateTime } from "@/lib/utils";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { useSession } from "@/components/providers/session-provider";

import { DetailPanel } from "@/components/dashboard/detail-panel";
import { HeaderFilters } from "@/components/dashboard/header-filters";
import { SectionGroup } from "@/components/dashboard/section-group";
import { DashboardItem } from "@/components/dashboard/types";
import { ProtectedPage } from "@/components/access/protected-page";

export default function CentreDashboardPage() {
  const params = useParams<{ harasId: string; centreId: string }>();
  const harasId = params.harasId;
  const centreId = params.centreId;

  const haras = getHarasById(harasId);
  const centre = getCentreById(centreId);
  const { getScopedSnapshot } = useMockDatabase();
  const { session } = useSession();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  if (!haras || !centre) {
    return null;
  }

  const snapshot = getScopedSnapshot(harasId, centreId);

  const dashboardItems = useMemo<DashboardItem[]>(() => {
    const commonTimestamp = formatDateTime(session.lastValidatedAt);
    const dataHref = buildWorkspacePath(harasId, "saisies");

    return [
      {
        id: "centre-mares",
        section: "TODO",
        filterId: "essential",
        title: "Juments",
        description: "Créer ou relire les fiches juments du centre.",
        badge: `${snapshot.mares.length} fiches`,
        badgeVariant: "info",
        href: buildWorkspacePath(harasId, "juments"),
        meta: [
          { icon: FileSpreadsheet, label: `${snapshot.mares.length} fiches` },
          { icon: MapPinned, label: centre.region },
          { icon: ShieldCheck, label: session.role },
        ],
        detailEyebrow: "Centre",
        detailTitle: "Base juments du centre",
        detailDescription:
          "Retrouvez les fiches juments liées au centre actif sans changer le fonctionnement métier existant.",
        highlightTitle: "Lecture locale",
        highlightText: `${snapshot.mares.length} fiche(s) visibles dans ${centre.name}.`,
        attachments: [
          {
            id: "centre-mares-view",
            label: "Ouvrir les juments",
            href: buildWorkspacePath(harasId, "juments"),
          },
          {
            id: "centre-mares-data",
            label: "Relire les données juments",
            href: `${dataHref}?tab=mares`,
          },
        ],
        comments: [
          {
            id: "centre-mares-comment-1",
            author: centre.manager,
            role: "Responsable centre",
            timestamp: commonTimestamp,
            message:
              "Les fiches affichées sont déjà filtrées sur le centre actif pour limiter les écarts de saisie.",
          },
        ],
      },
      {
        id: "centre-reproduction",
        section: "TODO",
        filterId: "essential",
        title: "Reproduction",
        description: "Saisir ou compléter les suivis de reproduction du centre.",
        badge: `${snapshot.reproductions.length} suivis`,
        badgeVariant: "default",
        href: buildWorkspacePath(harasId, "reproduction"),
        meta: [
          { icon: GitBranch, label: `${snapshot.reproductions.length} suivis` },
          { icon: MapPinned, label: centre.region },
          { icon: ShieldCheck, label: "Saisie guidée" },
        ],
        detailEyebrow: "Centre",
        detailTitle: "Suivi reproduction",
        detailDescription:
          "Le formulaire reproduction garde sa logique complète, avec les données déjà cadrées sur le centre sélectionné.",
        highlightTitle: "Formulaire prioritaire",
        highlightText: "Complétez les cycles, le diagnostic et les constats sans quitter le périmètre centre.",
        attachments: [
          {
            id: "centre-repro-view",
            label: "Ouvrir la reproduction",
            href: buildWorkspacePath(harasId, "reproduction"),
          },
          {
            id: "centre-repro-data",
            label: "Relire les suivis",
            href: `${dataHref}?tab=reproduction`,
          },
        ],
        comments: [
          {
            id: "centre-repro-comment-1",
            author: "SOREC",
            role: "Métier",
            timestamp: commonTimestamp,
            message:
              "La reproduction reste séparée de la déclaration de naissance pour une lecture plus claire.",
          },
        ],
      },
      {
        id: "centre-birth",
        section: "IN PROGRESS",
        filterId: "monitoring",
        title: "Déclaration de naissance",
        description: "Ouvrir l’onglet dédié aux naissances déclarées sur ce centre.",
        badge: `${snapshot.products.length} naissances`,
        badgeVariant: "success",
        href: buildWorkspacePath(harasId, "produits"),
        meta: [
          { icon: ClipboardCheck, label: `${snapshot.products.length} déclarations` },
          { icon: MapPinned, label: centre.region },
          { icon: ShieldCheck, label: "Module dédié" },
        ],
        detailEyebrow: "Centre",
        detailTitle: "Naissances du centre",
        detailDescription:
          "Les déclarations de naissance restent dans leur onglet dédié. Le dashboard centre les expose simplement dans une lecture plus moderne.",
        highlightTitle: "Flux séparé",
        highlightText: "La naissance reste gérée dans son module autonome, sans mélange avec la reproduction.",
        attachments: [
          {
            id: "centre-birth-view",
            label: "Ouvrir les déclarations",
            href: buildWorkspacePath(harasId, "produits"),
          },
          {
            id: "centre-birth-data",
            label: "Consulter l’historique",
            href: `${dataHref}?tab=produits`,
          },
        ],
        comments: [
          {
            id: "centre-birth-comment-1",
            author: centre.manager,
            role: "Centre",
            timestamp: commonTimestamp,
            message:
              "Les déclarations visibles sont limitées au centre actif pour garder un suivi local cohérent.",
          },
        ],
      },
      {
        id: "centre-data",
        section: "IN PROGRESS",
        filterId: "monitoring",
        title: "Données saisies",
        description: "Contrôler l’ensemble des données du centre dans une vue consolidée.",
        badge: `${snapshot.mares.length + snapshot.reproductions.length + snapshot.products.length} lignes`,
        badgeVariant: "outline",
        href: dataHref,
        meta: [
          { icon: Search, label: "Recherche rapide" },
          { icon: MapPinned, label: centre.region },
          { icon: ShieldCheck, label: `${centre.pendingReviews} relectures` },
        ],
        detailEyebrow: "Centre",
        detailTitle: "Vue consolidée du centre",
        detailDescription:
          "La consultation centralise les données du centre actif pour relire, filtrer et retrouver les dossiers saisis.",
        highlightTitle: "Contrôle local",
        highlightText: `${centre.pendingReviews} relecture(s) en attente sur ${centre.name}.`,
        attachments: [
          {
            id: "centre-data-view",
            label: "Ouvrir la consultation",
            href: dataHref,
          },
          {
            id: "centre-data-fertility",
            label: "Voir l’onglet fertilité",
            href: `${dataHref}?tab=fertilite`,
          },
        ],
        comments: [
          {
            id: "centre-data-comment-1",
            author: "Monitoring",
            role: centre.status,
            timestamp: commonTimestamp,
            message:
              "Le centre garde sa visibilité propre pour accélérer la relecture et les corrections locales.",
          },
        ],
      },
    ];
  }, [
    centre.manager,
    centre.name,
    centre.pendingReviews,
    centre.region,
    centre.status,
    harasId,
    session.lastValidatedAt,
    session.role,
    snapshot.mares.length,
    snapshot.products.length,
    snapshot.reproductions.length,
  ]);

  const filters = useMemo(
    () => [
      { id: "all", label: "Tout", count: `${dashboardItems.length}` },
      {
        id: "essential",
        label: "Essentiel",
        count: `${dashboardItems.filter((item) => item.filterId === "essential").length}`,
      },
      {
        id: "monitoring",
        label: "Suivi",
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
      label: "TODO",
      items: filteredItems.filter((item) => item.section === "TODO"),
    },
    {
      id: "in-progress",
      label: "IN PROGRESS",
      items: filteredItems.filter((item) => item.section === "IN PROGRESS"),
    },
  ];

  const handleShare = () => {
    if (!selectedItem || typeof window === "undefined") {
      return;
    }

    void navigator.clipboard.writeText(`${window.location.origin}${selectedItem.href}`);
    toast.success("Lien copié", {
      description: `Le raccourci vers ${selectedItem.title} a été copié.`,
    });
  };

  return (
    <ProtectedPage harasId={harasId} centreId={centreId}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-6">
          <HeaderFilters
            title={centre.name}
            description="Un dashboard centre plus clair pour lancer la saisie, contrôler les données et garder un point de lecture local, sans changer le flux métier."
            filters={filters}
            activeFilter={activeFilter}
            onChange={setActiveFilter}
          />

          <div className="space-y-8">
            {sections.map((section) => (
              <SectionGroup
                key={section.id}
                label={section.label}
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
