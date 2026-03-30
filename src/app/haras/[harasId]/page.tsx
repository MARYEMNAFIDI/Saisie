import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";

import { getHarasById } from "@/data/haras";
import { buildAccessPath } from "@/lib/navigation";

import { SorecLogo } from "@/components/branding/sorec-logo";
import { CentreCard } from "@/components/haras/centre-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
        <div className="relative space-y-6 p-6 text-white lg:p-8">
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

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div className="space-y-4">
              <p className="section-caption text-white/65">Accès haras</p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white lg:text-5xl">
                {haras.name}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/78 lg:text-base">
                Entrez dans la vue globale du haras ou choisissez directement un centre
                de saisie plus bas.
              </p>

              <div className="flex flex-wrap gap-2">
                <div className="rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/88">
                  {haras.stats.centreCount} centres
                </div>
                <div className="rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/88">
                  Accès sécurisé
                </div>
              </div>
            </div>

            <Link
              href={buildAccessPath(haras.id, "haras")}
              className="group block rounded-[1.75rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.08))] p-5 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.9)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                    Entrée principale
                  </p>
                  <h2 className="text-xl font-semibold text-white">Espace haras</h2>
                  <p className="text-sm leading-6 text-white/74">
                    Vue d'ensemble, centres et données du haras.
                  </p>
                </div>
                <div className="rounded-full border border-white/15 bg-white/10 p-3 text-white/88">
                  <LockKeyhole className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/12 pt-3">
                <span className="text-xs uppercase tracking-[0.2em] text-white/55">
                  Vue globale
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  Accéder
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-caption">Choisir un centre</p>
            <h2 className="text-3xl font-semibold text-slate-950">
              Entrer dans le bon centre
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            Ouvrez directement le centre concerné par votre saisie.
          </p>
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
