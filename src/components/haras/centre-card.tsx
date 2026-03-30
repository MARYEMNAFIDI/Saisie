import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getHarasById } from "@/data/haras";
import { Centre } from "@/types/domain";
import { buildAccessPath } from "@/lib/navigation";

import { Card, CardContent } from "@/components/ui/card";

const cardLabel = "Centre de reproduction équine";

const defaultPalette = {
  from: "from-slate-950",
  via: "via-slate-800",
  to: "to-cyan-500",
};

const getStandardCentreName = (region: string) => `Centre de reproduction équine de ${region}`;

export const CentreCard = ({
  centre,
  harasId,
}: {
  centre: Centre;
  harasId: string;
}) => {
  const haras = getHarasById(harasId);
  const palette = haras?.palette ?? defaultPalette;
  const title = centre.region || centre.name;
  const detail = centre.name === getStandardCentreName(title) ? null : centre.name;

  return (
    <Card className="group relative overflow-hidden border-white/80 bg-white/88 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_-46px_rgba(15,23,42,0.35)]">
      <div
        className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-r ${palette.from} ${palette.via} ${palette.to} opacity-[0.08]`}
      />
      <div className="absolute -right-8 top-4 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(193,139,56,0.18),transparent_72%)] blur-2xl" />
      <Image
        src="/les-chevaux.png"
        alt=""
        aria-hidden
        width={64}
        height={64}
        className="absolute right-6 top-6 h-16 w-16 object-contain opacity-[0.07] brightness-0"
      />

      <CardContent className="relative flex min-h-[280px] flex-col justify-between p-7">
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-slate-500">
              {cardLabel}
            </p>
            <div className="h-px w-16 bg-gradient-to-r from-[hsl(var(--accent))]/70 to-transparent" />
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              CRE / Centre
            </p>
            <h3 className="max-w-[12ch] text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-slate-950">
              {title}
            </h3>
          </div>

          <p className="max-w-md text-sm leading-7 text-slate-500">
            {detail ?? "Accès direct au centre pour ouvrir la saisie et retrouver les données utiles."}
          </p>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-slate-200/80 pt-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Accès direct
          </span>

          <Link
            href={buildAccessPath(harasId, "centre", centre.id)}
            className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent))]/30 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_18px_34px_-26px_rgba(180,134,76,0.55)] transition-all duration-300 hover:border-[hsl(var(--accent))]/50 hover:text-[hsl(var(--accent))]"
          >
            <span>Ouvrir le centre</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
