"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { getHarasById } from "@/data/haras";
import { buildWorkspacePath } from "@/lib/navigation";
import { downloadTextFile } from "@/lib/storage";
import { getRoleCapabilities } from "@/lib/permissions";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { useSession } from "@/components/providers/session-provider";
import { RecordFilters } from "@/types/domain";

import { ProtectedPage } from "@/components/access/protected-page";
import { MaresTable } from "@/components/data/mares-table";
import { EmptyState } from "@/components/empty-state";
import { FilterToolbar } from "@/components/filters/filter-toolbar";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MareListPage() {
  const params = useParams<{ harasId: string }>();
  const harasId = params.harasId;
  const haras = getHarasById(harasId);

  const { session } = useSession();
  const { getScopedSnapshot } = useMockDatabase();
  const capabilities = getRoleCapabilities(session.role);

  const scopedCentreId = session.scope === "centre" ? session.centreId : undefined;
  const visibleCentres = haras?.centres.filter((centre) =>
    scopedCentreId ? centre.id === scopedCentreId : true,
  );
  const snapshot = getScopedSnapshot(harasId, scopedCentreId);

  const [filters, setFilters] = useState<RecordFilters>({
    search: "",
    harasId,
    centreId: scopedCentreId ?? "all",
    season: "all",
    breed: "all",
  });

  if (!haras || !visibleCentres) {
    return null;
  }

  const filteredRecords = snapshot.mares.filter((record) => {
    const matchesSearch =
      !filters.search ||
      [record.name, record.farasNumber, record.owner, record.commune]
        .join(" ")
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    const matchesCentre =
      filters.centreId === "all" || record.centreId === filters.centreId;
    const matchesSeason =
      filters.season === "all" || record.season === filters.season;
    const matchesBreed = filters.breed === "all" || record.breed === filters.breed;

    return matchesSearch && matchesCentre && matchesSeason && matchesBreed;
  });

  const centresById = Object.fromEntries(
    visibleCentres.map((centre) => [centre.id, centre.name]),
  );

  const handleExportRecord = (record: (typeof filteredRecords)[number]) => {
    downloadTextFile(
      `fiche-jument-${record.farasNumber}.json`,
      JSON.stringify(record, null, 2),
    );
    toast.success("Export simule", {
      description: `La fiche ${record.name} a ete exportee en JSON local.`,
    });
  };

  return (
    <ProtectedPage harasId={harasId}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parcours CRE"
          title="1. Trouver une jument"
          description="Commencez ici pour rechercher une fiche, verifier les informations d'une jument ou preparer la saisie de reproduction."
          actions={
            <>
              <Badge variant="outline" className="bg-card/80 dark:bg-card/65">
                {filteredRecords.length} resultat(s)
              </Badge>
              {capabilities.canEdit ? (
                <Button asChild variant="accent">
                  <Link href={buildWorkspacePath(harasId, "reproduction")}>
                    <Plus className="h-4 w-4" />
                    Passer a la reproduction
                  </Link>
                </Button>
              ) : (
                <Badge variant="warning">
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Champs verrouilles
                </Badge>
              )}
            </>
          }
        />

        <FilterToolbar
          filters={filters}
          onChange={(key, value) =>
            setFilters((currentValue) => ({ ...currentValue, [key]: value }))
          }
          centres={visibleCentres}
          harasLabel={haras.name}
        />

        {snapshot.mares.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Aucune fiche disponible"
            description="Le perimetre actuel ne contient pas encore de fiche jument. Commencez par creer une saisie pour alimenter l'espace CRE."
            action={
              capabilities.canEdit ? (
                <Button asChild variant="accent">
                  <Link href={buildWorkspacePath(harasId, "reproduction")}>
                    Commencer une saisie
                  </Link>
                </Button>
              ) : null
            }
          />
        ) : (
          <MaresTable
            harasId={harasId}
            records={filteredRecords}
            centresById={centresById}
            canEdit={capabilities.canEdit}
            canExport={capabilities.canExport}
            onExport={handleExportRecord}
          />
        )}
      </div>
    </ProtectedPage>
  );
}
