"use client";

import { useParams } from "next/navigation";
import { Download, FileJson2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

import { getHarasById } from "@/data/haras";
import { downloadTextFile } from "@/lib/storage";
import { formatDateTime } from "@/lib/utils";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { useSession } from "@/components/providers/session-provider";

import { PageHeader } from "@/components/page-header";
import { ProtectedPage } from "@/components/access/protected-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const toCsv = (rows: Array<Record<string, string | number | boolean>>) => {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const escapeValue = (value: string | number | boolean) =>
    `"${String(value).replace(/"/g, '""')}"`;

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeValue(row[header])).join(",")),
  ].join("\n");
};

export default function ExportsPage() {
  const params = useParams<{ harasId: string }>();
  const harasId = params.harasId;
  const haras = getHarasById(harasId);

  const { session } = useSession();
  const { getScopedSnapshot } = useMockDatabase();
  const snapshot = getScopedSnapshot(
    harasId,
    session.scope === "centre" ? session.centreId : undefined,
  );

  if (!haras) {
    return null;
  }

  const lastUpdated = [
    ...snapshot.mares.map((record) => record.updatedAt),
    ...snapshot.reproductions.map((record) => record.updatedAt),
    ...snapshot.products.map((record) => record.updatedAt),
  ]
    .sort()
    .at(-1);

  const download = (filename: string, content: string, mimeType?: string) => {
    downloadTextFile(filename, content, mimeType);
    toast.success("Téléchargement simulé", {
      description: `${filename} a été généré localement.`,
    });
  };

  return (
    <ProtectedPage harasId={harasId} permission="export">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Exports"
          title="Téléchargements simulés"
          description="Les fichiers sont générés côté front à partir du state local du prototype. La structure est prête à être reliée plus tard à une API d'export."
          actions={
            <div className="rounded-full border border-border bg-white/80 px-4 py-2 text-sm text-muted-foreground">
              Dernière mise à jour: {formatDateTime(lastUpdated ?? null)}
            </div>
          }
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Export JSON complet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Agrège juments, suivis et produits du périmètre actif dans un seul
                fichier exploitable.
              </p>
              <Button
                className="w-full"
                onClick={() =>
                  download(
                    `${haras.id}-snapshot.json`,
                    JSON.stringify(snapshot, null, 2),
                  )
                }
              >
                <FileJson2 className="h-4 w-4" />
                Télécharger le JSON
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export CSV juments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Sortie tabulaire pour contrôle qualité ou consolidation externe.
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  download(
                    `${haras.id}-juments.csv`,
                    toCsv(
                      snapshot.mares.map((record) => ({
                        nom: record.name,
                        faras: record.farasNumber,
                        race: record.breed,
                        saison: record.season,
                        statut: record.admissionStatus,
                      })),
                    ),
                    "text/csv;charset=utf-8",
                  )
                }
              >
                <FileSpreadsheet className="h-4 w-4" />
                Télécharger le CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export CSV reproduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Extrait dédié aux cycles, diagnostics et constats de reproduction.
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  download(
                    `${haras.id}-reproduction.csv`,
                    toCsv(
                      snapshot.reproductions.map((record) => ({
                        mareId: record.mareId,
                        etalon: record.stallion,
                        typeSaillie: record.matingType,
                        diagnostic: record.diagnosis,
                        cycles: record.totalCycles,
                      })),
                    ),
                    "text/csv;charset=utf-8",
                  )
                }
              >
                <Download className="h-4 w-4" />
                Télécharger le CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Résumé du périmètre exporté</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Juments
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {snapshot.mares.length}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Reproduction
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {snapshot.reproductions.length}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Produits
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {snapshot.products.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedPage>
  );
}
