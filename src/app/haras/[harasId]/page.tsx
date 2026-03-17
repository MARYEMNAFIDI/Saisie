import Link from "next/link";
import { ArrowLeft, Building2, LockKeyhole, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { getHarasById } from "@/data/haras";
import { buildAccessPath } from "@/lib/navigation";

import { SorecLogo } from "@/components/branding/sorec-logo";
import { CentreCard } from "@/components/haras/centre-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function HarasDetailPage({
  params,
}: {
  params: Promise<{ harasId: string }>;
}) {
  const { harasId } = await params;
  const haras = getHarasById(harasId);

  if (!haras) {
    notFound();
  }

  return (
    <main className="container space-y-8 py-8 lg:py-10">
      <section className="hero-panel overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${haras.palette.from} ${haras.palette.via} ${haras.palette.to} opacity-[0.97]`}
        />
        <div className="relative space-y-8 p-6 text-white lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Link>
              </Button>
              <Badge className="border-white/20 bg-white/10 text-white">
                {haras.statusLabel}
              </Badge>
            </div>
            <SorecLogo tone="light" size="sm" />
          </div>

          <div className="max-w-4xl space-y-4">
            <p className="section-caption text-white/70">Choisir une entree</p>
            <h1 className="text-4xl font-semibold leading-tight text-white lg:text-5xl">
              {haras.name}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/75">
              Commencez par l'espace haras si vous avez une vue globale. Sinon,
              ouvrez directement le centre dans lequel vous travaillez.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Centres</p>
                <p className="mt-3 text-3xl font-semibold">{haras.stats.centreCount}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Formulaires
                </p>
                <p className="mt-3 text-3xl font-semibold">{haras.stats.activeForms}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Relectures</p>
                <p className="mt-3 text-3xl font-semibold">
                  {haras.stats.pendingReviews}
                </p>
              </div>
            </div>

            <Card className="border-white/20 bg-white/10 text-white">
              <CardContent className="space-y-5 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-caption text-white/70">Vue generale</p>
                    <h2 className="text-2xl font-semibold text-white">Espace haras</h2>
                  </div>
                </div>
                <p className="text-sm leading-7 text-white/75">
                  Ouvrez l'espace haras pour suivre l'ensemble des centres, consulter
                  les donnees et gerer la session.
                </p>
                <Button
                  asChild
                  variant="secondary"
                  className="w-full justify-between border-white/80 bg-white text-slate-950 hover:bg-white/95"
                >
                  <Link href={buildAccessPath(haras.id, "haras")}>
                    Ouvrir l'espace haras
                    <LockKeyhole className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-caption">Choisir un centre</p>
            <h2 className="text-3xl font-semibold text-slate-950">
              Entrer directement dans le bon centre
            </h2>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-2 text-sm text-muted-foreground md:flex">
            <Building2 className="h-4 w-4 text-primary" />
            Choisissez le centre le plus proche de votre saisie.
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {haras.centres.map((centre) => (
            <CentreCard key={centre.id} centre={centre} harasId={haras.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
