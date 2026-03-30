"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
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

import { DetailPanel } from "@/components/dashboard/detail-panel";
import { HeaderFilters } from "@/components/dashboard/header-filters";
import { SectionGroup } from "@/components/dashboard/section-group";
import { DashboardItem } from "@/components/dashboard/types";
import { ProtectedPage } from "@/components/access/protected-page";
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

  const dashboardItems = useMemo<DashboardItem[]>(() => {
    const commonTimestamp = formatDateTime(session.lastValidatedAt);
    const exportHref = buildWorkspacePath(harasId, "exports");
    const dataHref = buildWorkspacePath(harasId, "saisies");
    const operations: DashboardItem[] = [
      {
        id: "mares",
        section: "TODO",
        filterId: "essential",
        title: "Base juments",
        description: "Créer, relire et retrouver rapidement les fiches juments actives.",
        badge: `${snapshot.mares.length} fiches`,
        badgeVariant: "info",
        href: buildWorkspacePath(harasId, "juments"),
        meta: [
          { icon: FileSpreadsheet, label: `${snapshot.mares.length} juments visibles` },
          { icon: MapPinned, label: `${visibleCentres.length} centres couverts` },
          { icon: ShieldCheck, label: session.role },
        ],
        detailEyebrow: "Base métier",
        detailTitle: "Gestion des juments",
        detailDescription:
          "Cette vue centralise la création, la recherche et la mise à jour des fiches juments sur le périmètre actif. La logique métier reste inchangée, seule la lecture de l’interface est simplifiée.",
        highlightTitle: "Point d’entrée de la campagne",
        highlightText: `${snapshot.mares.length} fiches visibles sur ${visibleCentres.length} centres. Utilisez cette entrée pour qualifier la base avant la reproduction.`,
        attachments: [
          {
            id: "mares-view",
            label: "Ouvrir la liste des juments",
            href: buildWorkspacePath(harasId, "juments"),
            downloadHref: can("export") ? exportHref : buildWorkspacePath(harasId, "juments"),
          },
          {
            id: "mares-data",
            label: "Consulter les données liées",
            href: `${dataHref}?tab=mares`,
            downloadHref: can("export") ? exportHref : `${dataHref}?tab=mares`,
          },
        ],
        comments: [
          {
            id: "mares-comment-1",
            author: "Session métier",
            role: session.role,
            timestamp: commonTimestamp,
            message:
              "La base juments reste le premier point de contrôle avant toute nouvelle saisie.",
          },
          {
            id: "mares-comment-2",
            author: "Pilotage haras",
            role: haras.shortName,
            timestamp: `${visibleCentres.length} centres`,
            message:
              "Les fiches visibles sont déjà filtrées sur le périmètre actif pour éviter les écarts de saisie.",
          },
        ],
      },
      {
        id: "reproduction",
        section: "TODO",
        filterId: "essential",
        title: "Suivi reproduction",
        description: "Lancer une saisie complète de reproduction avec la fiche jument.",
        badge: `${snapshot.reproductions.length} suivis`,
        badgeVariant: "default",
        href: buildWorkspacePath(harasId, "reproduction"),
        meta: [
          { icon: GitBranch, label: `${snapshot.reproductions.length} enregistrements` },
          { icon: MapPinned, label: `${visibleCentres.length} centres visibles` },
          { icon: ShieldCheck, label: "Saisie guidée" },
        ],
        detailEyebrow: "Formulaire guidé",
        detailTitle: "Reproduction",
        detailDescription:
          "Le flux de reproduction conserve sa logique métier actuelle, avec un parcours complet pour la jument, l’étalon, les cycles et les constats associés.",
        highlightTitle: "Écran central de saisie",
        highlightText: "Utilisez ce module pour enregistrer les cycles, le diagnostic et le suivi FARAS sans changer le fonctionnement actuel.",
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
            author: "Contrôle qualité",
            role: "Workflow",
            timestamp: commonTimestamp,
            message:
              "Les résultats de cycle et le diagnostic restent regroupés dans la même chaîne de validation.",
          },
          {
            id: "repro-comment-2",
            author: "SOREC",
            role: "Métier",
            timestamp: `${snapshot.reproductions.length} suivis`,
            message:
              "Le formulaire reproduction reste séparé de la déclaration de naissance pour garder un flux clair.",
          },
        ],
      },
      {
        id: "birth-declaration",
        section: "TODO",
        filterId: "essential",
        title: "Déclaration de naissance",
        description: "Accéder à l’écran dédié pour gérer les naissances déclarées.",
        badge: `${snapshot.products.length} déclarations`,
        badgeVariant: "success",
        href: buildWorkspacePath(harasId, "produits"),
        meta: [
          { icon: ClipboardCheck, label: `${snapshot.products.length} naissances` },
          { icon: MapPinned, label: `${visibleCentres.length} centres suivis` },
          { icon: ShieldCheck, label: "Module dédié" },
        ],
        detailEyebrow: "Naissances",
        detailTitle: "Déclaration de naissance",
        detailDescription:
          "La déclaration de naissance reste volontairement séparée du flux reproduction. Cette séparation protège la logique métier et évite les doubles saisies.",
        highlightTitle: "Module autonome",
        highlightText: "L’onglet dédié concentre les informations de naissance, l’identification et le statut sans mélanger les étapes amont.",
        attachments: [
          {
            id: "birth-form",
            label: "Ouvrir les déclarations",
            href: buildWorkspacePath(harasId, "produits"),
            downloadHref: buildWorkspacePath(harasId, "produits"),
          },
          {
            id: "birth-data",
            label: "Consulter l’historique des naissances",
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
              "L’entrée reste isolée dans son onglet pour éviter tout mélange avec la reproduction.",
          },
          {
            id: "birth-comment-2",
            author: "Pilotage",
            role: haras.shortName,
            timestamp: `${snapshot.products.length} déclarations`,
            message:
              "Les déclarations visibles reflètent uniquement le périmètre autorisé de votre session.",
          },
        ],
      },
    ];

    const monitoringBase: DashboardItem[] = [
      {
        id: "data-room",
        section: "IN PROGRESS",
        filterId: "monitoring",
        title: "Vue consolidée",
        description: "Parcourir les données saisies, filtrer et relire les enregistrements.",
        badge: `${snapshot.mares.length + snapshot.reproductions.length + snapshot.products.length} lignes`,
        badgeVariant: "outline",
        href: dataHref,
        meta: [
          { icon: Search, label: "Recherche rapide" },
          { icon: MapPinned, label: `${visibleCentres.length} centres` },
          { icon: ShieldCheck, label: "Lecture consolidée" },
        ],
        detailEyebrow: "Contrôle",
        detailTitle: "Données consolidées",
        detailDescription:
          "Cette vue permet de relire juments, reproductions et déclarations de naissance dans un seul espace de consultation, sans modifier la structure métier existante.",
        highlightTitle: "Relecture transverse",
        highlightText: "Utilisez cette entrée pour retrouver un dossier, comparer les enregistrements ou préparer une extraction métier.",
        attachments: [
          {
            id: "data-view",
            label: "Ouvrir la consultation",
            href: dataHref,
            downloadHref: can("export") ? exportHref : dataHref,
          },
          {
            id: "data-fertility",
            label: "Voir l’onglet fertilité",
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
              "Les filtres de consultation respectent automatiquement le périmètre centre ou haras en cours.",
          },
          {
            id: "data-comment-2",
            author: "Support qualité",
            role: "Lecture",
            timestamp: `${visibleCentres.length} centres`,
            message:
              "La vue consolidée sert de point de contrôle rapide avant export ou validation finale.",
          },
        ],
      },
    ];

    if (can("export")) {
      monitoringBase.push({
        id: "exports",
        section: "IN PROGRESS",
        filterId: "monitoring",
        title: "Exports métier",
        description: "Préparer les sorties et récupérer les bases utiles au suivi.",
        badge: "Téléchargements",
        badgeVariant: "info",
        href: exportHref,
        meta: [
          { icon: FolderOutput, label: "CSV / XLSX" },
          { icon: MapPinned, label: haras.shortName },
          { icon: ShieldCheck, label: "Droits d’export" },
        ],
        detailEyebrow: "Exports",
        detailTitle: "Exports opérationnels",
        detailDescription:
          "Les exports conservent les mêmes règles d’accès. La refonte ne modifie ni le contenu ni les droits, uniquement la lecture de l’espace.",
        highlightTitle: "Sorties prêtes à l’usage",
        highlightText: "Utilisez cet espace pour récupérer les bases métiers sans quitter le workflow du dashboard.",
        attachments: [
          {
            id: "exports-base",
            label: "Ouvrir la page exports",
            href: exportHref,
            downloadHref: exportHref,
          },
          {
            id: "exports-data",
            label: "Relire la vue consolidée",
            href: dataHref,
            downloadHref: exportHref,
          },
        ],
        comments: [
          {
            id: "exports-comment-1",
            author: "Rôle export",
            role: session.role,
            timestamp: commonTimestamp,
            message:
              "Les sorties disponibles dépendent du rôle actif, sans modifier la source métier en amont.",
          },
          {
            id: "exports-comment-2",
            author: "SOREC",
            role: "Contrôle",
            timestamp: "Disponibilité active",
            message:
              "Les exports peuvent être préparés après relecture des données consolidées.",
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
            description: `${centre.pendingReviews} fiche(s) à revoir avant la prochaine saisie ou validation.`,
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
              "Cette alerte met en avant un centre qui nécessite une attention particulière. Le contenu métier n’est pas modifié: seuls les indicateurs sont réorganisés pour une lecture plus rapide.",
            highlightTitle: "Point de vigilance",
            highlightText: `${centre.pendingReviews} élément(s) en attente sur ${centre.region}. Une relecture est recommandée avant la prochaine session de saisie.`,
            attachments: [
              {
                id: `${centre.id}-dashboard`,
                label: "Ouvrir le dashboard du centre",
                href: buildDashboardPath(harasId, "centre", centre.id),
                downloadHref: buildDashboardPath(harasId, "centre", centre.id),
              },
              {
                id: `${centre.id}-data`,
                label: "Consulter les données du haras",
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
                  "Le centre reste visible dans le périmètre actuel pour faciliter la relance et la relecture des dossiers.",
              },
              {
                id: `${centre.id}-comment-2`,
                author: "Pilotage haras",
                role: haras.shortName,
                timestamp: commonTimestamp,
                message:
                  "Cette alerte provient des indicateurs de relecture et de synchronisation déjà disponibles dans les données.",
              },
            ],
          }))
        : [
            {
              id: "calm-flow",
              section: "IN PROGRESS",
              filterId: "monitoring",
              title: "Flux stabilisé",
              description: "Aucun centre prioritaire ni demande urgente de relecture sur le périmètre visible.",
              badge: "Stable",
              badgeVariant: "success",
              href: dataHref,
              meta: [
                { icon: ShieldCheck, label: "Aucune alerte critique" },
                { icon: MapPinned, label: `${visibleCentres.length} centres suivis` },
                { icon: Search, label: "Contrôle disponible" },
              ],
              detailEyebrow: "Monitoring",
              detailTitle: "Surveillance maîtrisée",
              detailDescription:
                "Le tableau de bord ne remonte aucun point critique sur les centres visibles. Les modules de consultation et d’export restent accessibles pour des vérifications complémentaires.",
              highlightTitle: "Alerte maîtrisée",
              highlightText: "Le flux est stable sur le périmètre actuel. Vous pouvez poursuivre la saisie ou ouvrir la consultation pour un contrôle ciblé.",
              attachments: [
                {
                  id: "calm-data",
                  label: "Ouvrir la consultation",
                  href: dataHref,
                  downloadHref: can("export") ? exportHref : dataHref,
                },
                {
                  id: "calm-repro",
                  label: "Revenir à la reproduction",
                  href: buildWorkspacePath(harasId, "reproduction"),
                  downloadHref: buildWorkspacePath(harasId, "reproduction"),
                },
              ],
              comments: [
                {
                  id: "calm-comment-1",
                  author: "Système",
                  role: "Monitoring",
                  timestamp: commonTimestamp,
                  message:
                    "Aucun centre ne dépasse actuellement le seuil critique de relecture ou de synchronisation.",
                },
                {
                  id: "calm-comment-2",
                  author: "Pilotage",
                  role: haras.shortName,
                  timestamp: `${visibleCentres.length} centres`,
                  message:
                    "La vigilance reste disponible via la consultation consolidée et les exports si nécessaire.",
                },
              ],
            },
          ];

    return [...operations, ...monitoringBase, ...alertItems];
  }, [
    alertCentres,
    can,
    haras.shortName,
    harasId,
    session.lastValidatedAt,
    session.role,
    snapshot.mares.length,
    snapshot.products.length,
    snapshot.reproductions.length,
    visibleCentres.length,
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

    const shareUrl = `${window.location.origin}${selectedItem.href}`;
    void navigator.clipboard.writeText(shareUrl);
    toast.success("Lien copié", {
      description: `Le raccourci vers ${selectedItem.title} a été copié.`,
    });
  };

  return (
    <ProtectedPage harasId={harasId}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-6">
          <HeaderFilters
            title={`Dashboard ${haras.shortName}`}
            description="Un point d’entrée plus calme et plus lisible pour piloter la saisie, ouvrir les modules utiles et suivre les centres visibles."
            filters={filters}
            activeFilter={activeFilter}
            onChange={setActiveFilter}
            actions={
              <Button asChild variant="outline">
                <Link href={buildWorkspacePath(harasId, "juments")}>
                  Ouvrir les juments
                </Link>
              </Button>
            }
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
