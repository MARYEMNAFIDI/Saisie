"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ClipboardCheck, FileSpreadsheet, GitBranch, Search } from "lucide-react";

import { getCentreById, getHarasById } from "@/data/haras";
import { buildWorkspacePath } from "@/lib/navigation";

import { PageHeader } from "@/components/page-header";
import { ProtectedPage } from "@/components/access/protected-page";
import { Button } from "@/components/ui/button";

export default function CentreDashboardPage() {
  const params = useParams<{ harasId: string; centreId: string }>();
  const harasId = params.harasId;
  const centreId = params.centreId;

  const haras = getHarasById(harasId);
  const centre = getCentreById(centreId);

  if (!haras || !centre) {
    return null;
  }

  return (
    <ProtectedPage harasId={harasId} centreId={centreId}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Accueil centre"
          title={centre.name}
          description="Point de depart du centre. Les actions principales sont regroupees ici pour faciliter la saisie."
          actions={
            <Button asChild variant="outline">
              <Link href={buildWorkspacePath(harasId, "juments")}>Ouvrir les juments</Link>
            </Button>
          }
        />

        <p className="max-w-xl text-sm text-muted-foreground">
          Vous etes dans le centre <strong>{centre.name}</strong>. Choisissez une action
          pour saisir ou retrouver rapidement des donnees.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: buildWorkspacePath(harasId, "juments"),
              title: "Juments",
              text: "Rechercher ou consulter les fiches juments.",
              icon: FileSpreadsheet,
            },
            {
              href: buildWorkspacePath(harasId, "reproduction"),
              title: "Reproduction",
              text: "Formulaire automatique complet de reproduction.",
              icon: GitBranch,
            },
            {
              href: buildWorkspacePath(harasId, "produits"),
              title: "Production",
              text: "Declarer une naissance dans l'ecran production.",
              icon: ClipboardCheck,
            },
            {
              href: buildWorkspacePath(harasId, "saisies"),
              title: "Donnees",
              text: "Consulter et verifier les informations saisies.",
              icon: Search,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[1.5rem] border border-border bg-muted/20 p-6 text-left transition hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                  <Icon className="h-5 w-5 text-primary group-hover:text-primary/90" />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </ProtectedPage>
  );
}
