import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

import { Haras } from "@/types/domain";

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
          ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.16)_0%,rgba(2,6,23,0.38)_42%,rgba(2,6,23,0.72)_72%,rgba(2,6,23,0.94)_100%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]"
          : "absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.3),transparent_42%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_34%)]"
      }
    />
    <CardContent className="relative flex h-full min-h-[320px] flex-col justify-end p-6 text-white">
      <div className="max-w-md space-y-4">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
          {haras.name}
        </h2>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/85 backdrop-blur">
          <Building2 className="h-4 w-4" />
          <span>{haras.stats.centreCount} centres</span>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          href={`/haras/${haras.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          <span>Ouvrir le haras</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </CardContent>
  </Card>
);
