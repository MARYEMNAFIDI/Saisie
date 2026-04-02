"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Save } from "lucide-react";

import {
  breedOptions,
  diagnosisOptions,
  formatDiagnosisLabel,
  formatMatingTypeLabel,
  formatPhysiologicalStatusLabel,
  formatStallionChoiceLabel,
  getStallionOptionsForHaras,
  isPositiveGestationDiagnosis,
  matingTypeOptions,
  physiologicalStatusOptions,
  reproductionIncidentOptions,
  seasonOptions,
} from "@/data/mockRecords";
import { Centre } from "@/types/domain";

import { createEmptyMareDraft, MareDraft } from "@/components/forms/mare-form";
import {
  downloadMareDigitalSheet,
  MareDigitalSheetFollowUpRow,
} from "@/components/forms/mare-digital-sheet";
import {
  createEmptyReproductionDraft,
  ReproductionDraft,
} from "@/components/forms/reproduction-form";
import { SelectWithOther } from "@/components/forms/select-with-other";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type CombinedEntryDraft = {
  mare: MareDraft;
  reproduction: ReproductionDraft;
};

const stallionCategoryOptions = [
  "National (SOREC)",
  "Prive",
  "Semence etrangere",
] as const;

const stallionCategoryLabels: Record<(typeof stallionCategoryOptions)[number], string> = {
  "National (SOREC)": "National (SOREC)",
  Prive: "Privé",
  "Semence etrangere": "Semence étrangère",
};

const admissionStatusOptions = ["acceptee", "refusee"] as const;
const admissionStatusLabels: Record<(typeof admissionStatusOptions)[number], string> = {
  acceptee: "Acceptée",
  refusee: "Refusée",
};

const coatOptions = ["PS", "AA", "Ar", "ArBr", "Br"] as const;
const yesNoOptions = ["OUI", "NON"] as const;
const productSexOptions = ["Femelle", "Male"] as const;
const productSexLabels: Record<(typeof productSexOptions)[number], string> = {
  Femelle: "Femelle",
  Male: "Mâle",
};

const getAgeFromBirthDate = (birthDate: string) => {
  if (!birthDate) {
    return "";
  }

  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const hasNotHadBirthday =
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());

  if (hasNotHadBirthday) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "";
};

const inferEnteredCycleCount = (reproduction: ReproductionDraft) =>
  [
    reproduction.firstCycleDate,
    reproduction.secondCycleDate,
    reproduction.thirdCycleDate,
    reproduction.fourthCycleDate,
  ].filter((value) => value && value.trim().length > 0).length;

const resolveResultCycle = (reproduction: ReproductionDraft) => {
  if (!isPositiveGestationDiagnosis(reproduction.diagnosis)) {
    return null;
  }

  const enteredCycleCount = inferEnteredCycleCount(reproduction);
  if (enteredCycleCount <= 1) {
    return 1;
  }

  return Math.min(enteredCycleCount, 4);
};

const computeCycleSummary = (reproduction: ReproductionDraft) => {
  const resolvedCycle = resolveResultCycle(reproduction);
  const enteredCycleCount = inferEnteredCycleCount(reproduction);
  const totalCycles = Math.max(enteredCycleCount, 1);

  if (resolvedCycle) {
    return {
      totalCycles,
      cycleResult: `Resultat obtenu au cycle ${resolvedCycle}`,
    };
  }

  if (enteredCycleCount > 0) {
    return {
      totalCycles,
      cycleResult: `Suivi en cours apres ${enteredCycleCount} cycle(s)`,
    };
  }

  return {
    totalCycles,
    cycleResult: "En attente de suivi",
  };
};

export const createEmptyCombinedEntryDraft = (
  harasId: string,
  centres: Centre[],
  centreId?: string,
): CombinedEntryDraft => {
  const scopedCentreId = centreId ?? centres[0]?.id ?? "";
  const mare = createEmptyMareDraft(harasId, scopedCentreId);
  const reproduction = createEmptyReproductionDraft(harasId);

  reproduction.centreId = scopedCentreId;
  reproduction.season = mare.season;

  const cycleSummary = computeCycleSummary(reproduction);

  return {
    mare,
    reproduction: {
      ...reproduction,
      totalCycles: cycleSummary.totalCycles,
      cycleResult: cycleSummary.cycleResult,
    },
  };
};

export const CombinedMareReproductionForm = ({
  initialValue,
  centres,
  harasLabel,
  readOnly,
  isSaving = false,
  onSave,
}: {
  initialValue: CombinedEntryDraft;
  centres: Centre[];
  harasLabel: string;
  readOnly: boolean;
  isSaving?: boolean;
  onSave: (draft: CombinedEntryDraft) => void | Promise<void>;
}) => {
  const [form, setForm] = useState<CombinedEntryDraft>(initialValue);

  useEffect(() => {
    setForm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setForm((currentValue) => {
      const nextReproduction = {
        ...currentValue.reproduction,
        centreId: currentValue.mare.centreId,
        season: currentValue.mare.season,
      };

      if (
        nextReproduction.centreId === currentValue.reproduction.centreId &&
        nextReproduction.season === currentValue.reproduction.season
      ) {
        return currentValue;
      }

      return {
        ...currentValue,
        reproduction: nextReproduction,
      };
    });
  }, [form.mare.centreId, form.mare.season]);

  useEffect(() => {
    setForm((currentValue) => {
      const cycleSummary = computeCycleSummary(currentValue.reproduction);

      if (
        cycleSummary.totalCycles === currentValue.reproduction.totalCycles &&
        cycleSummary.cycleResult === currentValue.reproduction.cycleResult
      ) {
        return currentValue;
      }

      return {
        ...currentValue,
        reproduction: {
          ...currentValue.reproduction,
          totalCycles: cycleSummary.totalCycles,
          cycleResult: cycleSummary.cycleResult,
        },
      };
    });
  }, [
    form.reproduction.diagnosis,
    form.reproduction.firstCycleDate,
    form.reproduction.secondCycleDate,
    form.reproduction.thirdCycleDate,
    form.reproduction.fourthCycleDate,
  ]);

  const selectedCentre = useMemo(
    () => centres.find((centre) => centre.id === form.mare.centreId),
    [centres, form.mare.centreId],
  );
  const stallionChoices = useMemo(() => {
    const scopedOptions = getStallionOptionsForHaras(
      form.mare.harasId || form.reproduction.harasId,
    );

    if (
      form.reproduction.stallion &&
      !scopedOptions.includes(form.reproduction.stallion)
    ) {
      return [form.reproduction.stallion, ...scopedOptions];
    }

    return scopedOptions;
  }, [
    form.mare.harasId,
    form.reproduction.harasId,
    form.reproduction.stallion,
  ]);
  const followUpRows: MareDigitalSheetFollowUpRow[] = [
    {
      date: form.reproduction.followUpDate || form.reproduction.firstCycleDate,
      b: form.reproduction.bValue,
      og: form.reproduction.leftOvary,
      od: form.reproduction.rightOvary,
      matrice: form.reproduction.uterus,
      liquide: form.reproduction.fluid,
      commentaire:
        form.reproduction.followUpComment || form.reproduction.latestFinding,
    },
  ];
  const isRefusalReasonRequired = form.mare.admissionStatus === "refusee";
  const isFarasReasonRequired = form.reproduction.farasEntryStatus === "NON";
  const isLatestFindingRequired =
    form.reproduction.heatReturn ||
    form.reproduction.abortion ||
    form.reproduction.embryoResorption ||
    form.reproduction.nonOvulation ||
    form.reproduction.uterineInfection ||
    form.reproduction.twinPregnancy ||
    form.reproduction.traumaticAccident;

  return (
    <Card className="mx-auto w-full max-w-6xl border-border/70 bg-card/85 dark:border-slate-800/90 dark:bg-slate-950/88">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-caption">Reproduction</p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              Formulaire reproduction
            </h2>
            <p className="mt-2 text-sm text-muted-foreground dark:text-slate-300">
              Formulaire automatique complet pour la fiche jument et le bilan reproduction.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-200 dark:hover:border-emerald-400/40 dark:hover:bg-emerald-500/18 dark:hover:text-emerald-100"
              onClick={() =>
                downloadMareDigitalSheet({
                  form: form.mare,
                  centres,
                  harasLabel,
                  followUpRows,
                })
              }
            >
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-200" />
              Telecharger fiche de suivie jument
            </Button>
            <Badge variant={readOnly ? "warning" : "success"}>
              {readOnly ? "Lecture seule" : "Edition active"}
            </Badge>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-muted/35 p-5 dark:border-slate-800/80 dark:bg-slate-900/54">
          <p className="section-caption">Bloc jument</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mare-name" required>
                Nom de la jument
              </Label>
              <Input
                id="mare-name"
                value={form.mare.name}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, name: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mare-faras" required>
                Numero FARAS
              </Label>
              <Input
                id="mare-faras"
                value={form.mare.farasNumber}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: {
                      ...currentValue.mare,
                      farasNumber: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mare-transponder">N° Transpondeur</Label>
              <Input
                id="mare-transponder"
                value={form.mare.transponderNumber}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: {
                      ...currentValue.mare,
                      transponderNumber: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Centre</Label>
              <Select
                value={form.mare.centreId}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, centreId: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un centre" />
                </SelectTrigger>
                <SelectContent>
                  {centres.map((centre) => (
                    <SelectItem key={centre.id} value={centre.id}>
                      {centre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label required>Race</Label>
              <SelectWithOther
                value={form.mare.breed}
                options={breedOptions}
                disabled={readOnly}
                otherPlaceholder="Saisir une autre race"
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, breed: value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mare-birth-date" required>
                Date naissance jument
              </Label>
              <Input
                id="mare-birth-date"
                type="date"
                value={form.mare.birthDate}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, birthDate: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mare-age">Age</Label>
              <Input
                id="mare-age"
                value={getAgeFromBirthDate(form.mare.birthDate)}
                disabled
                placeholder="Calcule automatiquement"
              />
            </div>
            <div className="space-y-2">
              <Label>Robe</Label>
              <SelectWithOther
                value={form.mare.coat}
                options={coatOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser une autre robe"
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, coat: value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Saison</Label>
              <Select
                value={form.mare.season}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, season: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {seasonOptions.map((season) => (
                    <SelectItem key={season} value={season}>
                      {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mare-bcs" required>
                Note BCS
              </Label>
              <Input
                id="mare-bcs"
                value={form.mare.bcs}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, bcs: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Admission</Label>
              <SelectWithOther
                value={form.mare.admissionStatus}
                options={admissionStatusOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser un autre statut d'admission"
                renderOptionLabel={(option) =>
                  admissionStatusLabels[option as (typeof admissionStatusOptions)[number]]
                }
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: {
                      ...currentValue.mare,
                      admissionStatus: value as MareDraft["admissionStatus"],
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mare-owner" required>
                Proprietaire - nom et prenom
              </Label>
              <Input
                id="mare-owner"
                value={form.mare.owner}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, owner: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mare-phone">Telephone</Label>
              <Input
                id="mare-phone"
                value={form.mare.phone}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, phone: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="mare-breeding-address">Adresse de l'elevage</Label>
              <Input
                id="mare-breeding-address"
                value={form.mare.breedingAddress}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: {
                      ...currentValue.mare,
                      breedingAddress: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Statut</Label>
              <SelectWithOther
                value={form.mare.physiologicalStatus}
                options={physiologicalStatusOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser un autre statut physiologique"
                renderOptionLabel={formatPhysiologicalStatusLabel}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, physiologicalStatus: value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mare-weight">Poids (Kg)</Label>
              <Input
                id="mare-weight"
                type="number"
                min={0}
                value={form.mare.weightKg}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, weightKg: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mare-stallion-primary">Etalon I</Label>
              <Input
                id="mare-stallion-primary"
                value={form.mare.stallionPrimary}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: {
                      ...currentValue.mare,
                      stallionPrimary: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mare-stallion-secondary">Etalon II</Label>
              <Input
                id="mare-stallion-secondary"
                value={form.mare.stallionSecondary}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: {
                      ...currentValue.mare,
                      stallionSecondary: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="mare-vulva">Conformation de la vulve</Label>
              <Input
                id="mare-vulva"
                value={form.mare.vulvaConformation}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: {
                      ...currentValue.mare,
                      vulvaConformation: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="mare-history">Historique</Label>
              <Textarea
                id="mare-history"
                value={form.mare.history}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, history: event.target.value },
                  }))
                }
              />
            </div>
          </div>

          {form.mare.admissionStatus === "refusee" ? (
            <div className="mt-5 rounded-[1.25rem] border border-rose-200 bg-rose-50/80 p-4 dark:border-rose-500/30 dark:bg-rose-500/12">
              <div className="space-y-2">
                <Label htmlFor="mare-refusal" required={isRefusalReasonRequired}>
                  Motif de refus
                </Label>
                <p className="text-sm text-rose-700 dark:text-rose-200">
                  Si la jument est refusee, saisissez ici le motif du refus.
                </p>
                <Textarea
                  id="mare-refusal"
                  value={form.mare.refusalReason}
                  disabled={readOnly}
                  onChange={(event) =>
                    setForm((currentValue) => ({
                      ...currentValue,
                      mare: {
                        ...currentValue.mare,
                        refusalReason: event.target.value,
                      },
                    }))
                  }
                  placeholder="Ex: age non conforme, etat sanitaire, dossier incomplet..."
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-border bg-card/60 p-5 dark:border-slate-800/80 dark:bg-slate-950/72">
          <p className="section-caption">Bloc reproduction</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label required>Étalon</Label>
              <SelectWithOther
                value={form.reproduction.stallion}
                options={stallionChoices}
                disabled={readOnly}
                otherPlaceholder="Saisir un autre étalon"
                renderOptionLabel={formatStallionChoiceLabel}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      stallion: value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stallion-faras" required>
                N FARAS de l etalon
              </Label>
              <Input
                id="stallion-faras"
                value={form.reproduction.stallionFarasNumber}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      stallionFarasNumber: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stallion-birth-date" required>
                Date de naissance de l etalon
              </Label>
              <Input
                id="stallion-birth-date"
                type="date"
                value={form.reproduction.stallionBirthDate}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      stallionBirthDate: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Race de l etalon</Label>
              <SelectWithOther
                value={form.reproduction.stallionBreed}
                options={breedOptions}
                disabled={readOnly}
                otherPlaceholder="Saisir une autre race d'étalon"
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      stallionBreed: value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Categorie etalon</Label>
              <SelectWithOther
                value={form.reproduction.stallionCategory}
                options={stallionCategoryOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser une autre catégorie d'étalon"
                renderOptionLabel={(option) =>
                  stallionCategoryLabels[option as (typeof stallionCategoryOptions)[number]]
                }
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      stallionCategory: value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Type de saillie</Label>
              <SelectWithOther
                value={form.reproduction.matingType}
                options={matingTypeOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser un autre type de saillie"
                renderOptionLabel={formatMatingTypeLabel}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      matingType: value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cycle-1" required>
                Date cycle 1
              </Label>
              <Input
                id="cycle-1"
                type="date"
                value={form.reproduction.firstCycleDate}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      firstCycleDate: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cycle-2">Date cycle 2</Label>
              <Input
                id="cycle-2"
                type="date"
                value={form.reproduction.secondCycleDate}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      secondCycleDate: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cycle-3">Date cycle 3</Label>
              <Input
                id="cycle-3"
                type="date"
                value={form.reproduction.thirdCycleDate}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      thirdCycleDate: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cycle-4">Date cycle 4</Label>
              <Input
                id="cycle-4"
                type="date"
                value={form.reproduction.fourthCycleDate}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      fourthCycleDate: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-cycles">Nombre total de cycles (auto)</Label>
              <Input
                id="total-cycles"
                type="number"
                min={1}
                max={4}
                value={form.reproduction.totalCycles}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fertile-cycles">Cycles fécondés</Label>
              <Input
                id="fertile-cycles"
                type="number"
                min={0}
                step={1}
                value={form.reproduction.fertileCycles}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      fertileCycles: Number(event.target.value || 0),
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="non-fertile-cycles">Cycles non fécondés</Label>
              <Input
                id="non-fertile-cycles"
                type="number"
                min={0}
                step={1}
                value={form.reproduction.nonFertileCycles}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      nonFertileCycles: Number(event.target.value || 0),
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Diagnostic</Label>
              <SelectWithOther
                value={form.reproduction.diagnosis}
                options={diagnosisOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser un autre diagnostic"
                renderOptionLabel={formatDiagnosisLabel}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      diagnosis: value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dps-number" required>
                N DPS
              </Label>
              <Input
                id="dps-number"
                value={form.reproduction.dpsNumber}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      dpsNumber: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Saisie sur FARAS</Label>
              <SelectWithOther
                value={form.reproduction.farasEntryStatus}
                options={yesNoOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser une autre valeur FARAS"
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      farasEntryStatus: value as ReproductionDraft["farasEntryStatus"],
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latest-finding" required={isLatestFindingRequired}>
                Dernier constat
              </Label>
              <Input
                id="latest-finding"
                value={form.reproduction.latestFinding}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      latestFinding: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-4 lg:col-span-2">
              <div>
                <p className="section-caption">Tableau de suivi</p>
                <p className="mt-2 text-sm text-muted-foreground dark:text-slate-300">
                  Renseignez la ligne de suivi clinique associee a cette saisie.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="follow-up-date">Date</Label>
                  <Input
                    id="follow-up-date"
                    type="date"
                    value={form.reproduction.followUpDate}
                    disabled={readOnly}
                    onChange={(event) =>
                      setForm((currentValue) => ({
                        ...currentValue,
                        reproduction: {
                          ...currentValue.reproduction,
                          followUpDate: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow-up-b">B</Label>
                  <Input
                    id="follow-up-b"
                    value={form.reproduction.bValue}
                    disabled={readOnly}
                    onChange={(event) =>
                      setForm((currentValue) => ({
                        ...currentValue,
                        reproduction: {
                          ...currentValue.reproduction,
                          bValue: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow-up-og">OG</Label>
                  <Input
                    id="follow-up-og"
                    value={form.reproduction.leftOvary}
                    disabled={readOnly}
                    onChange={(event) =>
                      setForm((currentValue) => ({
                        ...currentValue,
                        reproduction: {
                          ...currentValue.reproduction,
                          leftOvary: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow-up-od">OD</Label>
                  <Input
                    id="follow-up-od"
                    value={form.reproduction.rightOvary}
                    disabled={readOnly}
                    onChange={(event) =>
                      setForm((currentValue) => ({
                        ...currentValue,
                        reproduction: {
                          ...currentValue.reproduction,
                          rightOvary: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow-up-uterus">Matrice</Label>
                  <Input
                    id="follow-up-uterus"
                    value={form.reproduction.uterus}
                    disabled={readOnly}
                    onChange={(event) =>
                      setForm((currentValue) => ({
                        ...currentValue,
                        reproduction: {
                          ...currentValue.reproduction,
                          uterus: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow-up-fluid">Liquide</Label>
                  <Input
                    id="follow-up-fluid"
                    value={form.reproduction.fluid}
                    disabled={readOnly}
                    onChange={(event) =>
                      setForm((currentValue) => ({
                        ...currentValue,
                        reproduction: {
                          ...currentValue.reproduction,
                          fluid: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2 xl:col-span-2">
                  <Label htmlFor="follow-up-comment">Commentaire</Label>
                  <Textarea
                    id="follow-up-comment"
                    value={form.reproduction.followUpComment}
                    disabled={readOnly}
                    onChange={(event) =>
                      setForm((currentValue) => ({
                        ...currentValue,
                        reproduction: {
                          ...currentValue.reproduction,
                          followUpComment: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            {form.reproduction.farasEntryStatus === "NON" ? (
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="faras-reason" required={isFarasReasonRequired}>
                  Cause (si NON)
                </Label>
                <Input
                  id="faras-reason"
                  value={form.reproduction.farasEntryReason}
                  disabled={readOnly}
                  onChange={(event) =>
                    setForm((currentValue) => ({
                      ...currentValue,
                      reproduction: {
                        ...currentValue.reproduction,
                        farasEntryReason: event.target.value,
                      },
                    }))
                  }
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="prev-sirema" required>
                SIREMA produit N-1
              </Label>
              <Input
                id="prev-sirema"
                value={form.reproduction.previousProductSirema}
                placeholder="Ex: 20101307C"
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      previousProductSirema: event.target.value.toUpperCase().replace(/\s+/g, ""),
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prev-birth" required>
                Date naissance produit N-1
              </Label>
              <Input
                id="prev-birth"
                type="date"
                value={form.reproduction.previousProductBirthDate}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      previousProductBirthDate: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Sexe produit N-1</Label>
              <Select
                value={form.reproduction.previousProductSex}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      previousProductSex: value as ReproductionDraft["previousProductSex"],
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Femelle">{productSexLabels.Femelle}</SelectItem>
                  <SelectItem value="Male">{productSexLabels.Male}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label required>Race produit N-1</Label>
              <Select
                value={form.reproduction.previousProductBreed}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      previousProductBreed: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {breedOptions.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label required>Declaration produit N-1</Label>
              <Select
                value={form.reproduction.previousProductDeclaration}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      previousProductDeclaration:
                        value as ReproductionDraft["previousProductDeclaration"],
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUI">OUI</SelectItem>
                  <SelectItem value="NON">NON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label required>Identification produit N-1</Label>
              <Select
                value={form.reproduction.previousProductIdentification}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      previousProductIdentification:
                        value as ReproductionDraft["previousProductIdentification"],
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUI">OUI</SelectItem>
                  <SelectItem value="NON">NON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-2">
              <Label htmlFor="repro-observations">Observations</Label>
              <Textarea
                id="repro-observations"
                value={form.reproduction.observations}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      observations: event.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Incidents a signaler</p>
              {reproductionIncidentOptions.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm font-medium text-foreground dark:border-slate-700/80 dark:bg-slate-900/84 dark:text-slate-100"
                >
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(
                      form.reproduction[item.key as keyof ReproductionDraft],
                    )}
                    disabled={readOnly}
                    onChange={(event) =>
                      setForm((currentValue) => ({
                        ...currentValue,
                        reproduction: {
                          ...currentValue.reproduction,
                          [item.key]: event.target.checked,
                        },
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-muted/30 p-5 dark:border-slate-800/80 dark:bg-slate-900/44">
          <p className="section-caption">Contexte de saisie</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground lg:grid-cols-3">
            <p>
              <span className="font-semibold text-foreground">Centre:</span>{" "}
              {selectedCentre?.name ?? "Non selectionne"}
            </p>
            <p>
              <span className="font-semibold text-foreground">Saison:</span>{" "}
              {form.mare.season}
            </p>
            <p>
              <span className="font-semibold text-foreground">Resultat cycle:</span>{" "}
              {form.reproduction.cycleResult}
            </p>
          </div>
        </div>

        {!readOnly ? (
          <div className="flex justify-end">
            <Button disabled={isSaving} onClick={() => void onSave(form)}>
              <Save className="h-4 w-4" />
              {isSaving ? "Enregistrement..." : "Enregistrer la reproduction"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
