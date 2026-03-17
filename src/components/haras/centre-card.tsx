import Link from "next/link";
import { ArrowRight, Shield, TentTree, Workflow } from "lucide-react";

import { Centre } from "@/types/domain";
import { buildAccessPath } from "@/lib/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const typeLabel = {
  centre: "CRE / Centre",
  station: "Station de monte",
  national_center: "Centre national",
};

export const CentreCard = ({
  centre,
  harasId,
}: {
  centre: Centre;
  harasId: string;
}) => (
  <Card className="group border-white/80 bg-white/80 transition-transform duration-300 hover:-translate-y-1">
    <CardContent className="space-y-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="outline" className="bg-white/80">
            {typeLabel[centre.type]}
          </Badge>
          <div>
            <h3 className="text-xl font-semibold leading-tight text-slate-950">
              {centre.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{centre.region}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-secondary/70 p-3 text-primary">
          <TentTree className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl bg-muted/60 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Juments
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-950">
            {centre.activeMares}
          </p>
        </div>
        <div className="rounded-2xl bg-muted/60 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Revue
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-950">
            {centre.pendingReviews}
          </p>
        </div>
        <div className="rounded-2xl bg-muted/60 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Statut
          </p>
          <p className="mt-2 text-sm font-semibold capitalize text-slate-950">
            {centre.status}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[1.25rem] border border-border/80 bg-white/80 px-4 py-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>Connexion requise</span>
        </div>
        <Workflow className="h-4 w-4 text-muted-foreground" />
      </div>

      <Button asChild className="w-full justify-between">
        <Link href={buildAccessPath(harasId, "centre", centre.id)}>
          Ouvrir le centre
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </CardContent>
  </Card>
);
