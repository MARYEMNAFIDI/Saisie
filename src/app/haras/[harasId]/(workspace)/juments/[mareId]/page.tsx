"use client";

import Link from "next/link";
import { useState } from "react";
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
  const { mares, upsertMare, writeEnabled, error: storageError } = useMockDatabase();
  const { session, can } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  if (!haras) {
    return null;
  }

  const record = mares.find((mare) => mare.id === mareId && mare.harasId === harasId);

  const initialDraft: MareDraft = record
    ? (({ id, createdAt, updatedAt, createdBy, updatedBy, ...rest }) => ({
        ...createEmptyMareDraft(harasId, record.centreId),
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

  const handleSave = async (draft: MareDraft) => {
    if (!can("edit") || !writeEnabled || isSaving) {
      return;
    }

    const requiredChecks: Array<{ valid: boolean; label: string }> = [
      { valid: Boolean(draft.name.trim()), label: "Nom de la jument" },
      { valid: Boolean(draft.farasNumber.trim()), label: "Numero FARAS" },
      { valid: Boolean(draft.centreId.trim()), label: "Centre" },
      { valid: Boolean(draft.breed.trim()), label: "Race" },
      { valid: Boolean(draft.owner.trim()), label: "Proprietaire" },
      { valid: Boolean(draft.birthDate.trim()), label: "Date de naissance" },
      { valid: Boolean(draft.physiologicalStatus.trim()), label: "Statut physiologique" },
      { valid: Boolean(draft.bcs.trim()), label: "BCS" },
      { valid: Boolean(draft.season.trim()), label: "Saison" },
    ];

    if (draft.admissionStatus === "refusee") {
      requiredChecks.push({
        valid: Boolean(draft.refusalReason.trim()),
        label: "Motif de refus",
      });
    }

    const missingLabels = requiredChecks
      .filter((item) => !item.valid)
      .map((item) => item.label);

    if (missingLabels.length > 0) {
      toast.error("Formulaire incomplet", {
        description: `Champs requis manquants: ${missingLabels.slice(0, 4).join(", ")}${
          missingLabels.length > 4 ? "..." : ""
        }`,
      });
      return;
    }

    setIsSaving(true);

    try {
      const savedRecord = await upsertMare({
        ...draft,
        harasId,
      });

      toast.success("Fiche enregistree", {
        description: `La fiche de ${savedRecord.name} a ete mise a jour.`,
      });

      if (isNew) {
        router.replace(buildWorkspacePath(harasId, `juments/${savedRecord.id}`));
      }
    } catch (saveError) {
      toast.error("Enregistrement impossible", {
        description:
          saveError instanceof Error
            ? saveError.message
            : storageError ?? "La fiche n'a pas pu etre enregistree.",
      });
    } finally {
      setIsSaving(false);
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
          <Card className="border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/12">
            <CardContent className="flex items-start gap-4 p-6">
              <LockKeyhole className="mt-1 h-5 w-5 text-amber-700 dark:text-amber-200" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Fiche hors périmètre
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">
                  La session actuelle est limitée à un autre centre. Cette fiche ne
                  peut pas être consultée depuis ce profil.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !isNew && !record ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              La fiche demandee n'existe pas dans la base active.
            </CardContent>
          </Card>
        ) : isNew && !can("edit") ? (
          <Card className="border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/12">
            <CardContent className="flex items-start gap-4 p-6">
              <Save className="mt-1 h-5 w-5 text-amber-700 dark:text-amber-200" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Création désactivée pour ce rôle
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">
                  Le rôle courant permet la consultation, mais pas la création d'une
                  nouvelle fiche.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : isNew && !writeEnabled ? (
          <Card className="border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/12">
            <CardContent className="flex items-start gap-4 p-6">
              <Save className="mt-1 h-5 w-5 text-amber-700 dark:text-amber-200" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Ecriture distante indisponible
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">
                  Le stockage Google Sheets n&apos;est pas accessible pour le moment.
                  {storageError ? ` ${storageError}` : ""}
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
            readOnly={!can("edit") || !writeEnabled}
            isSaving={isSaving}
            onSave={handleSave}
          />
        )}
      </div>
    </ProtectedPage>
  );
}
