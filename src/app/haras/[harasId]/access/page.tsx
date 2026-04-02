"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { getCentreById, getHarasById } from "@/data/haras";
import { AccessGate } from "@/components/access/access-gate";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";

export default function AccessPage() {
  const params = useParams<{ harasId: string }>();
  const searchParams = useSearchParams();

  const harasId = params.harasId;
  const scope = searchParams.get("scope") === "centre" ? "centre" : "haras";
  const centreId = searchParams.get("centreId") ?? undefined;

  const haras = getHarasById(harasId);
  const centre = centreId ? getCentreById(centreId) : undefined;

  return (
    <main className="container space-y-8 py-8 lg:py-10">
      <PageHeader
        eyebrow="Acces"
        title={scope === "haras" ? haras?.name ?? "Haras" : centre?.name ?? "Centre"}
        description="Choisissez votre profil, saisissez votre mot de passe, puis ouvrez directement votre espace de travail."
        actions={
          <Badge variant="outline" className="bg-card/80 dark:bg-card/65">
            <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
            Mot de passe requis
          </Badge>
        }
      />
      <AccessGate harasId={harasId} scope={scope} centreId={centreId} />
    </main>
  );
}
