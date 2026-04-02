"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  FileSpreadsheet,
  GitBranch,
  MapPinned,
  Search,
  ShieldCheck,
} from "lucide-react";

import { getCentreById, getHarasById } from "@/data/haras";
import { buildWorkspacePath } from "@/lib/navigation";
import { useMockDatabase } from "@/components/providers/mock-db-provider";

import { ProtectedPage } from "@/components/access/protected-page";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CentreDashboardPage() {
  const params = useParams<{ harasId: string; centreId: string }>();
  const harasId = params.harasId;
  const centreId = params.centreId;

  const haras = getHarasById(harasId);
  const centre = getCentreById(centreId);
  const { getScopedSnapshot } = useMockDatabase();

  if (!haras || !centre) {
    return null;
  }

  const snapshot = getScopedSnapshot(harasId, centreId);
  const dataHref = buildWorkspacePath(harasId, "saisies");
  const totalVisibleRows =
    snapshot.mares.length + snapshot.reproductions.length + snapshot.products.length;
  const needsAttention =
    centre.pendingReviews >= 4 || centre.status !== "synchronise";

  const steps = [
    {
      id: "mares",
      icon: Search,
      title: "1. Trouver une jument",
      description: "Rechercher une fiche jument ou verifier une information avant saisie.",
      value: `${snapshot.mares.length} fiches`,
      href: buildWorkspacePath(harasId, "juments"),
      actionLabel: "Ouvrir les juments",
      tone: "info" as const,
    },
    {
      id: "reproduction",
      icon: GitBranch,
      title: "2. Saisir la reproduction",
      description: "Enregistrer la saillie, les cycles et le suivi reproduction.",
      value: `${snapshot.reproductions.length} suivis`,
      href: buildWorkspacePath(harasId, "reproduction"),
      actionLabel: "Ouvrir la reproduction",
      tone: "default" as const,
    },
    {
      id: "birth",
      icon: ClipboardCheck,
      title: "3. Declarer une naissance",
      description: "Ajouter le produit et renseigner son statut de declaration.",
      value: `${snapshot.products.length} naissances`,
      href: buildWorkspacePath(harasId, "produits"),
      actionLabel: "Ouvrir les naissances",
      tone: "success" as const,
    },
    {
      id: "verification",
      icon: FileSpreadsheet,
      title: "4. Verifier les donnees",
      description: "Relire les saisies du centre avant validation ou correction.",
      value: `${totalVisibleRows} lignes`,
      href: dataHref,
      actionLabel: "Ouvrir la verification",
      tone: "outline" as const,
    },
  ];

  return (
    <ProtectedPage harasId={harasId} centreId={centreId}>
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          eyebrow="Centre"
          title={centre.name}
          description="Accueil simplifie pour les agents de saisie. Suivez simplement le parcours: jument, reproduction, naissance, puis verification."
          actions={
            <>
              <Button asChild variant="accent">
                <Link href={buildWorkspacePath(harasId, "juments")}>
                  Commencer la saisie
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={dataHref}>Verifier les donnees</Link>
              </Button>
            </>
          }
        />

        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{centre.region}</Badge>
              <Badge variant="outline">{centre.manager}</Badge>
            </div>

            <div className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800/90 dark:bg-slate-950/72">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 dark:border dark:border-sky-400/20 dark:bg-slate-900/95 dark:text-sky-300">
                  {needsAttention ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                    {needsAttention
                      ? "Relecture a prioriser"
                      : "Centre pret pour la saisie"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">
                    {needsAttention
                      ? `${centre.pendingReviews} relecture(s) sont encore ouvertes sur ce centre. Commencez par la verification si besoin.`
                      : "Aucune alerte critique. Vous pouvez commencer directement la saisie."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Parcours de saisie</CardTitle>
            <CardDescription>
              Seulement quatre actions utiles. Choisissez l'etape dont vous avez besoin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex flex-col gap-4 rounded-[1.4rem] border border-slate-200/80 bg-white/88 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/90 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.9),rgba(15,23,42,0.82))]"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 dark:border dark:border-sky-400/20 dark:bg-slate-950/96 dark:text-sky-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-950 dark:text-slate-100">
                          {step.title}
                        </p>
                        <Badge variant={step.tone}>{step.value}</Badge>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="sm:shrink-0">
                    <Link href={step.href}>
                      {step.actionLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:border dark:border-slate-800 dark:bg-slate-950/95 dark:text-sky-300">
                <MapPinned className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                  Resume du centre
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">
                  {snapshot.mares.length} juments, {snapshot.reproductions.length} suivis,
                  {" "}{snapshot.products.length} naissances.
                </p>
              </div>
            </div>

            <Button asChild variant="ghost" className="sm:shrink-0">
              <Link href={dataHref}>Voir toutes les donnees</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedPage>
  );
}
