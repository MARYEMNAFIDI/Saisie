import Link from "next/link";
import { ArrowRight, Building2, FileText, ShieldCheck } from "lucide-react";

import { Haras } from "@/types/domain";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const HarasCard = ({ haras }: { haras: Haras }) => (
  <Card className="group relative overflow-hidden border-white/70 bg-white/80 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
    {haras.coverImage ? (
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
        style={{ backgroundImage: `url(${haras.coverImage})` }}
      />
    ) : (
      <div
        className={`absolute inset-0 bg-gradient-to-br ${haras.palette.from} ${haras.palette.via} ${haras.palette.to} opacity-[0.96] transition-transform duration-500 group-hover:scale-[1.02]`}
      />
    )}
    <div
      className={
        haras.coverImage
          ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.22),rgba(15,23,42,0.72)),radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]"
          : "absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.3),transparent_42%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_34%)]"
      }
    />
    <CardContent className="relative flex h-full flex-col p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] backdrop-blur">
          {haras.statusLabel}
        </div>
        <Building2 className="h-5 w-5 text-white/80" />
      </div>

      <div className="mt-10 space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-white/64">{haras.city}</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white">
            {haras.name}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
            Accéder aux centres rattachés et aux espaces sécurisés de saisie.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.25rem] border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-white/70">
              <Building2 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.18em]">Centres</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">{haras.stats.centreCount}</p>
          </div>
          <div className="rounded-[1.25rem] border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-white/70">
              <FileText className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.18em]">Formulaires</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">{haras.stats.activeForms}</p>
          </div>
          <div className="rounded-[1.25rem] border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-white/70">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.18em]">Statut</span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6">{haras.stats.status}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button
          asChild
          variant="outline"
          className="w-full justify-between border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/16 hover:text-white"
        >
          <Link href={`/haras/${haras.id}`}>
            Accéder
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);
