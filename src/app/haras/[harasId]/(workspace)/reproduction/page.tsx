"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { getHarasById } from "@/data/haras";
import { formatDiagnosisLabel } from "@/data/mockRecords";
import { buildWorkspacePath } from "@/lib/navigation";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { useSession } from "@/components/providers/session-provider";
import { ProtectedPage } from "@/components/access/protected-page";
import {
  CombinedEntryDraft,
  CombinedMareReproductionForm,
  createEmptyCombinedEntryDraft,
} from "@/components/forms/combined-mare-reproduction-form";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ESIREMA_REGEX = /^\d{8}[A-Z]$/;
const normalizeEsirema = (value: string) => value.trim().toUpperCase();

export default function ReproductionPage() {
  const params = useParams<{ harasId: string }>();
  const harasId = params.harasId;

  const haras = getHarasById(harasId);
  const { getScopedSnapshot, upsertMare, upsertReproduction } = useMockDatabase();
  const { session, can } = useSession();
  const snapshot = getScopedSnapshot(
    harasId,
    session.scope === "centre" ? session.centreId : undefined,
  );
  const scopedCentres = haras?.centres.filter((centre) =>
    session.scope === "centre" && session.centreId
      ? centre.id === session.centreId
      : true,
  );

  const [activeId, setActiveId] = useState<string>("new");

  useEffect(() => {
    if (activeId === "new" || snapshot.reproductions.some((record) => record.id === activeId)) {
      return;
    }

    setActiveId(snapshot.reproductions[0]?.id ?? "new");
  }, [activeId, snapshot.reproductions]);

  if (!haras || !scopedCentres) {
    return null;
  }

  const activeRecord =
    activeId === "new"
      ? null
      : snapshot.reproductions.find((record) => record.id === activeId) ?? null;

  const initialDraft: CombinedEntryDraft = activeRecord
    ? (() => {
        const linkedMare = snapshot.mares.find(
          (mare) => mare.id === activeRecord.mareId,
        );
        const baseDraft = createEmptyCombinedEntryDraft(
          harasId,
          scopedCentres,
          activeRecord.centreId,
        );

        return {
          mare: linkedMare
            ? {
                id: linkedMare.id,
                harasId: linkedMare.harasId,
                centreId: linkedMare.centreId,
                season: linkedMare.season,
                name: linkedMare.name,
                farasNumber: linkedMare.farasNumber,
                transponderNumber: linkedMare.transponderNumber ?? "",
                breed: linkedMare.breed,
                birthDate: linkedMare.birthDate,
                coat: linkedMare.coat ?? "",
                stallionPrimary: linkedMare.stallionPrimary ?? "",
                stallionSecondary: linkedMare.stallionSecondary ?? "",
                owner: linkedMare.owner,
                phone: linkedMare.phone,
                commune: linkedMare.commune,
                breedingAddress: linkedMare.breedingAddress ?? "",
                history: linkedMare.history ?? "",
                weightKg: linkedMare.weightKg ?? "",
                physiologicalStatus: linkedMare.physiologicalStatus,
                bcs: linkedMare.bcs,
                vulvaConformation: linkedMare.vulvaConformation ?? "",
                admissionStatus: linkedMare.admissionStatus,
                refusalReason: linkedMare.refusalReason,
              }
            : baseDraft.mare,
          reproduction: {
            id: activeRecord.id,
            mareId: activeRecord.mareId,
            harasId: activeRecord.harasId,
            centreId: activeRecord.centreId,
            season: activeRecord.season,
            stallion: activeRecord.stallion,
            stallionFarasNumber: activeRecord.stallionFarasNumber ?? "",
            stallionBirthDate: activeRecord.stallionBirthDate ?? "",
            stallionBreed:
              activeRecord.stallionBreed ?? baseDraft.reproduction.stallionBreed,
            stallionCategory:
              activeRecord.stallionCategory ?? baseDraft.reproduction.stallionCategory,
            matingType: activeRecord.matingType,
            firstCycleDate: activeRecord.firstCycleDate,
            secondCycleDate: activeRecord.secondCycleDate,
            thirdCycleDate: activeRecord.thirdCycleDate,
            fourthCycleDate: activeRecord.fourthCycleDate,
            totalCycles: activeRecord.totalCycles,
            fertileCycles: activeRecord.fertileCycles ?? 0,
            nonFertileCycles: activeRecord.nonFertileCycles ?? 0,
            cycleResult: activeRecord.cycleResult,
            diagnosis: activeRecord.diagnosis,
            dpsNumber: activeRecord.dpsNumber ?? "",
            farasEntryStatus:
              activeRecord.farasEntryStatus ?? baseDraft.reproduction.farasEntryStatus,
            farasEntryReason: activeRecord.farasEntryReason ?? "",
            previousProductSirema: activeRecord.previousProductSirema ?? "",
            previousProductBirthDate: activeRecord.previousProductBirthDate ?? "",
            previousProductSex:
              activeRecord.previousProductSex ?? baseDraft.reproduction.previousProductSex,
            previousProductBreed:
              activeRecord.previousProductBreed ??
              baseDraft.reproduction.previousProductBreed,
            previousProductDeclaration:
              activeRecord.previousProductDeclaration ??
              baseDraft.reproduction.previousProductDeclaration,
            previousProductIdentification:
              activeRecord.previousProductIdentification ??
              baseDraft.reproduction.previousProductIdentification,
            heatReturn: activeRecord.heatReturn,
            abortion: activeRecord.abortion,
            embryoResorption: activeRecord.embryoResorption,
            nonOvulation: activeRecord.nonOvulation ?? false,
            uterineInfection: activeRecord.uterineInfection ?? false,
            twinPregnancy: activeRecord.twinPregnancy ?? false,
            traumaticAccident: activeRecord.traumaticAccident ?? false,
            followUpDate: activeRecord.followUpDate ?? "",
            bValue: activeRecord.bValue ?? "",
            leftOvary: activeRecord.leftOvary ?? "",
            rightOvary: activeRecord.rightOvary ?? "",
            uterus: activeRecord.uterus ?? "",
            fluid: activeRecord.fluid ?? "",
            followUpComment: activeRecord.followUpComment ?? "",
            latestFinding: activeRecord.latestFinding,
            observations: activeRecord.observations,
          },
        };
      })()
    : createEmptyCombinedEntryDraft(
        harasId,
        scopedCentres,
        session.scope === "centre" ? session.centreId ?? undefined : scopedCentres[0]?.id,
      );

  const handleSave = (draft: CombinedEntryDraft) => {
    if (!can("edit")) {
      return;
    }

    const requiredChecks: Array<{ valid: boolean; label: string }> = [
      { valid: Boolean(draft.mare.centreId), label: "Centre de reproduction" },
      { valid: Boolean(draft.mare.name.trim()), label: "Nom de la jument" },
      { valid: Boolean(draft.mare.farasNumber.trim()), label: "N FARAS jument" },
      { valid: Boolean(draft.mare.breed.trim()), label: "Race jument" },
      { valid: Boolean(draft.mare.birthDate.trim()), label: "Date naissance jument" },
      { valid: Boolean(draft.mare.owner.trim()), label: "Proprietaire jument" },
      { valid: Boolean(draft.mare.physiologicalStatus.trim()), label: "Statut physiologique" },
      { valid: Boolean(draft.mare.bcs.trim()), label: "BCS jument sur 5" },
      { valid: Boolean(draft.reproduction.stallion.trim()), label: "Nom etalon" },
      {
        valid: Boolean(draft.reproduction.stallionFarasNumber.trim()),
        label: "N FARAS etalon",
      },
      {
        valid: Boolean(draft.reproduction.stallionBirthDate.trim()),
        label: "Date naissance etalon",
      },
      { valid: Boolean(draft.reproduction.stallionBreed.trim()), label: "Race etalon" },
      {
        valid: Boolean(draft.reproduction.stallionCategory.trim()),
        label: "Categorie etalon",
      },
      { valid: Boolean(draft.reproduction.matingType.trim()), label: "Type de saillie" },
      { valid: Boolean(draft.reproduction.firstCycleDate.trim()), label: "Date cycle 1" },
      { valid: Boolean(draft.reproduction.secondCycleDate.trim()), label: "Date cycle 2" },
      { valid: Boolean(draft.reproduction.thirdCycleDate.trim()), label: "Date cycle 3" },
      { valid: Boolean(draft.reproduction.fourthCycleDate.trim()), label: "Date cycle 4" },
      { valid: Boolean(draft.reproduction.diagnosis.trim()), label: "Diagnostic" },
      { valid: Boolean(draft.reproduction.dpsNumber.trim()), label: "N DPS" },
      { valid: Boolean(draft.reproduction.latestFinding.trim()), label: "Dernier constat" },
      { valid: Boolean(draft.reproduction.observations.trim()), label: "Observations" },
      {
        valid: Boolean(draft.reproduction.farasEntryStatus.trim()),
        label: "Saisie sur FARAS",
      },
      {
        valid: Boolean(draft.reproduction.previousProductSirema.trim()),
        label: "SIREMA produit N-1",
      },
      {
        valid: Boolean(draft.reproduction.previousProductBirthDate.trim()),
        label: "Date naissance produit N-1",
      },
      {
        valid: Boolean(draft.reproduction.previousProductSex.trim()),
        label: "Sexe produit N-1",
      },
      {
        valid: Boolean(draft.reproduction.previousProductBreed.trim()),
        label: "Race produit N-1",
      },
      {
        valid: Boolean(draft.reproduction.previousProductDeclaration.trim()),
        label: "Declaration produit N-1",
      },
      {
        valid: Boolean(draft.reproduction.previousProductIdentification.trim()),
        label: "Identification produit N-1",
      },
    ];

    if (draft.mare.admissionStatus === "refusee") {
      requiredChecks.push({
        valid: Boolean(draft.mare.refusalReason.trim()),
        label: "Cause jument refusee",
      });
    }

    if (draft.reproduction.farasEntryStatus === "NON") {
      requiredChecks.push({
        valid: Boolean(draft.reproduction.farasEntryReason.trim()),
        label: "Cause de non saisie FARAS",
      });
    }

    const hasIncidentSelected =
      draft.reproduction.heatReturn ||
      draft.reproduction.abortion ||
      draft.reproduction.embryoResorption ||
      draft.reproduction.nonOvulation ||
      draft.reproduction.uterineInfection ||
      draft.reproduction.twinPregnancy ||
      draft.reproduction.traumaticAccident;

    if (hasIncidentSelected) {
      requiredChecks.push({
        valid: Boolean(draft.reproduction.latestFinding.trim()),
        label: "Dernier constat incident",
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

    const normalizedPreviousProductSirema = normalizeEsirema(
      draft.reproduction.previousProductSirema,
    );

    if (!ESIREMA_REGEX.test(normalizedPreviousProductSirema)) {
      toast.error("Format ESIREMA invalide", {
        description:
          "Le N° ESIREMA doit respecter le format 8 chiffres + 1 lettre (ex: 20101307C).",
      });
      return;
    }

    const savedMare = upsertMare({
      ...draft.mare,
      harasId,
      centreId: draft.mare.centreId,
      season: draft.mare.season,
    });

    const savedRecord = upsertReproduction({
      ...draft.reproduction,
      previousProductSirema: normalizedPreviousProductSirema,
      harasId,
      mareId: savedMare.id,
      centreId: savedMare.centreId,
      season: draft.reproduction.season || savedMare.season,
    });

    setActiveId(savedRecord.id);
    toast.success("Saisie enregistree", {
      description: `La fiche de ${savedMare.name} et son suivi reproduction sont enregistres.`,
    });
  };

  return (
    <ProtectedPage harasId={harasId}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parcours CRE"
          title="2. Saisir la reproduction"
          description="Utilisez cet ecran pour enregistrer la saillie, les cycles et le suivi reproduction. C'est l'etape centrale du parcours de saisie CRE."
          actions={
            <>
              <Button
                variant="accent"
                disabled={!can("edit")}
                onClick={() => setActiveId("new")}
              >
                <Plus className="h-4 w-4" />
                Nouvelle saisie reproduction
              </Button>
              <Button asChild variant="outline">
                <Link href={buildWorkspacePath(harasId, "produits")}>
                  Etape suivante: naissance
                </Link>
              </Button>
            </>
          }
        />

        <div className="space-y-6">
          <CombinedMareReproductionForm
            initialValue={initialDraft}
            centres={scopedCentres}
            harasLabel={haras.name}
            readOnly={!can("edit")}
            onSave={handleSave}
          />

          <Card className="mx-auto w-full max-w-6xl">
            <CardHeader>
              <CardTitle>Saisies reproduction deja enregistrees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.reproductions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun suivi enregistre sur ce perimetre.
                </p>
              ) : (
                snapshot.reproductions.map((record) => {
                  const mare = snapshot.mares.find((item) => item.id === record.mareId);

                  return (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => setActiveId(record.id)}
                      className={`w-full rounded-[1.25rem] border px-4 py-3 text-left transition-colors ${
                        activeId === record.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-white/85 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {mare?.name ?? "Jument non trouvee"}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {record.stallion}
                          </p>
                        </div>
                        <Badge variant="outline">{record.totalCycles} cycle(s)</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {formatDiagnosisLabel(record.diagnosis)}
                      </p>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  );
}
