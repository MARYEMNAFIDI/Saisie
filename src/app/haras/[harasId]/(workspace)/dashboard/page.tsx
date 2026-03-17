"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ClipboardCheck,
  FileSpreadsheet,
  GitBranch,
  Search,
} from "lucide-react";

import { getHarasById } from "@/data/haras";
import { buildWorkspacePath } from "@/lib/navigation";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { useSession } from "@/components/providers/session-provider";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { ProtectedPage } from "@/components/access/protected-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HarasDashboardPage() {
  const params = useParams<{ harasId: string }>();
  const harasId = params.harasId;

  const haras = getHarasById(harasId);
  const { getScopedSnapshot } = useMockDatabase();
  const { session, can } = useSession();

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

  return (
    <ProtectedPage harasId={harasId}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Accueil"
          title={`Bienvenue dans ${haras.shortName}`}
          description="Utilisez cette page comme point de depart. Les actions essentielles sont regroupees ici pour aller plus vite."
          actions={
            <Button asChild variant="outline">
              <Link href={buildWorkspacePath(harasId, "juments")}>Ouvrir les juments</Link>
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={FileSpreadsheet}
            label="Juments"
            value={`${snapshot.mares.length}`}
            hint="Fiches actuellement visibles."
          />
          <MetricCard
            icon={GitBranch}
            label="Reproduction"
            value={`${snapshot.reproductions.length}`}
            hint="Suivis deja enregistres."
          />
          <MetricCard
            icon={ClipboardCheck}
            label="Production"
            value={`${snapshot.products.length}`}
            hint="Productions declarees sur le perimetre."
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Que voulez-vous faire ?</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[
                {
                  href: buildWorkspacePath(harasId, "juments"),
                  step: "1",
                  title: "Ajouter ou retrouver une jument",
                  text: "Creer une fiche ou retrouver rapidement une jument deja saisie.",
                },
                {
                  href: buildWorkspacePath(harasId, "reproduction"),
                  step: "2",
                  title: "Saisir la reproduction",
                  text: "Formulaire automatique complet de reproduction.",
                },
                {
                  href: buildWorkspacePath(harasId, "produits"),
                  step: "3",
                  title: "Declarer une production",
                  text: "La naissance reste dans son ecran separe de production.",
                },
                {
                  href: buildWorkspacePath(harasId, "saisies"),
                  step: "4",
                  title: "Retrouver une saisie",
                  text: "Chercher une fiche, un suivi ou un produit dans les donnees.",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[1.5rem] border border-border bg-muted/20 p-5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 justify-center">
                      {item.step}
                    </Badge>
                    <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perimetre actif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.25rem] border border-border bg-white/85 p-4">
                <p className="text-sm font-semibold text-slate-950">Session ouverte</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-semibold text-slate-950">Role:</span> {session.role}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-950">Centres visibles:</span>{" "}
                    {visibleCentres.length}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-950">Relectures:</span>{" "}
                    {visibleCentres.reduce((sum, centre) => sum + centre.pendingReviews, 0)}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-slate-950">
                    Pour retrouver une information
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Utilisez la page Donnees si vous cherchez une jument, un suivi ou une
                  naissance deja saisie.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href={buildWorkspacePath(harasId, "saisies")}>Ouvrir les donnees</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={alertCentres.length > 0 ? "border-amber-200 bg-amber-50/70" : ""}>
          <CardContent className="p-5">
            {alertCentres.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                  <div>
                    <p className="font-semibold text-slate-950">Points a verifier</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      Certains centres demandent un suivi prioritaire avant la prochaine saisie.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {alertCentres.map((centre) => (
                    <div
                      key={centre.id}
                      className="rounded-[1.25rem] border border-amber-200 bg-white/80 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-950">{centre.name}</p>
                        <Badge variant="warning">{centre.status}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">
                        {centre.pendingReviews} fiche(s) a revoir.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-700">
                Aucun point critique sur les centres actuellement visibles.
              </div>
            )}
          </CardContent>
        </Card>

        {can("export") ? (
          <Button
            asChild
            variant="secondary"
            className="w-full border-white/80 bg-white text-slate-950 hover:bg-white/95 sm:w-auto"
          >
            <Link href={buildWorkspacePath(harasId, "exports")}>Ouvrir les exports</Link>
          </Button>
        ) : null}
      </div>
    </ProtectedPage>
  );
}
