"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, Save } from "lucide-react";
import { toast } from "sonner";

import { getHarasById } from "@/data/haras";
import { buildWorkspacePath } from "@/lib/navigation";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { useSession } from "@/components/providers/session-provider";

import {
  createEmptyMareDraft,
  MareDraft,
  MareForm,
} from "@/components/forms/mare-form";
import { PageHeader } from "@/components/page-header";
import { ProtectedPage } from "@/components/access/protected-page";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MareDetailPage() {
  const params = useParams<{ harasId: string; mareId: string }>();
  const router = useRouter();
  const harasId = params.harasId;
  const mareId = params.mareId;
  const isNew = mareId === "new";

  const haras = getHarasById(harasId);
  const { mares, upsertMare } = useMockDatabase();
  const { session, can } = useSession();

  if (!haras) {
    return null;
  }

  const record = mares.find((mare) => mare.id === mareId && mare.harasId === harasId);

  const initialDraft: MareDraft = record
    ? (({ id, createdAt, updatedAt, createdBy, updatedBy, ...rest }) => ({
        id,
        ...rest,
      }))(record)
    : createEmptyMareDraft(
        harasId,
        session.scope === "centre" ? session.centreId ?? undefined : haras.centres[0]?.id,
      );

  const isForbiddenCentreRecord =
    session.scope === "centre" &&
    record &&
    session.centreId &&
    record.centreId !== session.centreId;

  const handleSave = (draft: MareDraft) => {
    if (!can("edit")) {
      return;
    }

    const savedRecord = upsertMare({
      ...draft,
      harasId,
    });

    toast.success("Fiche enregistrée", {
      description: `La fiche de ${savedRecord.name} a été mise à jour localement.`,
    });

    if (isNew) {
      router.replace(buildWorkspacePath(harasId, `juments/${savedRecord.id}`));
    }
  };

  return (
    <ProtectedPage harasId={harasId}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Fiche jument"
          title={isNew ? "Créer une fiche" : record?.name ?? "Fiche introuvable"}
          description="Écran de consultation et de saisie du dossier jument, avec verrouillage des champs selon le rôle simulé."
          actions={
            <Button asChild variant="outline">
              <Link href={buildWorkspacePath(harasId, "juments")}>
                <ArrowLeft className="h-4 w-4" />
                Retour à la liste
              </Link>
            </Button>
          }
        />

        {isForbiddenCentreRecord ? (
          <Card className="border-amber-200 bg-amber-50/70">
            <CardContent className="flex items-start gap-4 p-6">
              <LockKeyhole className="mt-1 h-5 w-5 text-amber-700" />
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Fiche hors périmètre
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  La session actuelle est limitée à un autre centre. Cette fiche ne
                  peut pas être consultée depuis ce profil.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !isNew && !record ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              La fiche demandée n'existe pas dans les données mockées.
            </CardContent>
          </Card>
        ) : isNew && !can("edit") ? (
          <Card className="border-amber-200 bg-amber-50/70">
            <CardContent className="flex items-start gap-4 p-6">
              <Save className="mt-1 h-5 w-5 text-amber-700" />
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Création désactivée pour ce rôle
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Le rôle courant permet la consultation, mais pas la création d'une
                  nouvelle fiche.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <MareForm
            initialValue={initialDraft}
            centres={haras.centres.filter((centre) =>
              session.scope === "centre" && session.centreId
                ? centre.id === session.centreId
                : true,
            )}
            harasLabel={haras.name}
            readOnly={!can("edit")}
            onSave={handleSave}
          />
        )}
      </div>
    </ProtectedPage>
  );
}
