"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { getHarasById } from "@/data/haras";
import { buildWorkspacePath } from "@/lib/navigation";
import { downloadTextFile } from "@/lib/storage";
import { getRoleCapabilities } from "@/lib/permissions";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { useSession } from "@/components/providers/session-provider";
import { RecordFilters } from "@/types/domain";

import { ProtectedPage } from "@/components/access/protected-page";
import { FilterToolbar } from "@/components/filters/filter-toolbar";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConsultationPage() {
  const params = useParams<{ harasId: string }>();
  const harasId = params.harasId;
  const haras = getHarasById(harasId);

  const { session } = useSession();
  const { getScopedSnapshot } = useMockDatabase();
  const capabilities = getRoleCapabilities(session.role);

  const scopedCentreId = session.scope === "centre" ? session.centreId : undefined;
  const snapshot = getScopedSnapshot(harasId, scopedCentreId);
  const visibleCentres = haras?.centres.filter((centre) =>
    scopedCentreId ? centre.id === scopedCentreId : true,
  );

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

  const filteredMares = snapshot.mares.filter((record) => {
    const matchesSearch =
      !filters.search ||
      [record.name, record.farasNumber, record.owner, record.commune]
        .join(" ")
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    return (
      matchesSearch &&
      (filters.centreId === "all" || record.centreId === filters.centreId) &&
      (filters.season === "all" || record.season === filters.season) &&
      (filters.breed === "all" || record.breed === filters.breed)
    );
  });

  const filteredMareIds = new Set(filteredMares.map((record) => record.id));
  const mareNameById = Object.fromEntries(
    snapshot.mares.map((mare) => [mare.id, mare.name]),
  );
  const centreNameById = Object.fromEntries(
    visibleCentres.map((centre) => [centre.id, centre.name]),
  );

  const filteredReproductions = snapshot.reproductions.filter((record) =>
    filteredMareIds.has(record.mareId),
  );
  const filteredProducts = snapshot.products.filter((record) =>
    filteredMareIds.has(record.mareId),
  );

  const handleExport = (label: string, payload: unknown) => {
    downloadTextFile(
      `${label}-${haras.shortName.toLowerCase().replace(/\s+/g, "-")}.json`,
      JSON.stringify(payload, null, 2),
    );
    toast.success("Export simulé", {
      description: `${label} a été téléchargé en JSON local.`,
    });
  };

  return (
    <ProtectedPage harasId={harasId}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Consultation"
          title="Données saisies"
          description="Vue consolidée des fiches, suivis et produits avec filtres multi-critères sur le périmètre autorisé."
          actions={
            capabilities.canExport ? (
              <Button
                variant="outline"
                onClick={() =>
                  handleExport("consultation", {
                    mares: filteredMares,
                    reproductions: filteredReproductions,
                    products: filteredProducts,
                  })
                }
              >
                <Download className="h-4 w-4" />
                Exporter la vue
              </Button>
            ) : null
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

        <Tabs defaultValue="mares">
          <TabsList>
            <TabsTrigger value="mares">Juments</TabsTrigger>
            <TabsTrigger value="reproduction">Reproduction</TabsTrigger>
            <TabsTrigger value="produits">Production</TabsTrigger>
          </TabsList>

          <TabsContent value="mares">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jument</TableHead>
                      <TableHead>FARAS</TableHead>
                      <TableHead>Centre</TableHead>
                      <TableHead>Race</TableHead>
                      <TableHead>Saison</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMares.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.farasNumber}</TableCell>
                        <TableCell>{centreNameById[record.centreId]}</TableCell>
                        <TableCell>{record.breed}</TableCell>
                        <TableCell>{record.season}</TableCell>
                        <TableCell>
                          <Button asChild size="sm" variant="ghost">
                            <Link href={buildWorkspacePath(harasId, `juments/${record.id}`)}>
                              Voir
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reproduction">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jument</TableHead>
                      <TableHead>Étalon</TableHead>
                      <TableHead>Cycles</TableHead>
                      <TableHead>Diagnostic</TableHead>
                      <TableHead>Constat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReproductions.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{mareNameById[record.mareId]}</TableCell>
                        <TableCell>{record.stallion}</TableCell>
                        <TableCell>{record.totalCycles}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.latestFinding}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produits">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jument</TableHead>
                      <TableHead>SIREMA</TableHead>
                      <TableHead>Naissance</TableHead>
                      <TableHead>Sexe</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{mareNameById[record.mareId]}</TableCell>
                        <TableCell>{record.siremaProduct}</TableCell>
                        <TableCell>{record.birthDate}</TableCell>
                        <TableCell>{record.sex}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.productStatus}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedPage>
  );
}
