"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";

import {
  breedOptions,
  diagnosisOptions,
  matingTypeOptions,
  physiologicalStatusOptions,
  seasonOptions,
  stallionOptions,
} from "@/data/mockRecords";
import { Centre } from "@/types/domain";

import { createEmptyMareDraft, MareDraft } from "@/components/forms/mare-form";
import {
  createEmptyReproductionDraft,
  ReproductionDraft,
} from "@/components/forms/reproduction-form";
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

const inferEnteredCycleCount = (reproduction: ReproductionDraft) =>
  [
    reproduction.firstCycleDate,
    reproduction.secondCycleDate,
    reproduction.thirdCycleDate,
    reproduction.fourthCycleDate,
  ].filter((value) => value && value.trim().length > 0).length;

const resolveResultCycle = (reproduction: ReproductionDraft) => {
  const diagnosisCode = reproduction.diagnosis.trim().toUpperCase();
  if (diagnosisCode !== "PP") {
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
  readOnly,
  onSave,
}: {
  initialValue: CombinedEntryDraft;
  centres: Centre[];
  readOnly: boolean;
  onSave: (draft: CombinedEntryDraft) => void;
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

  return (
    <Card className="mx-auto w-full max-w-6xl border-white/80 bg-white/85">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-caption">Reproduction</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Formulaire reproduction
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Formulaire automatique complet pour la fiche jument et le bilan reproduction.
            </p>
          </div>
          <Badge variant={readOnly ? "warning" : "success"}>
            {readOnly ? "Lecture seule" : "Edition active"}
          </Badge>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-slate-50/70 p-5">
          <p className="section-caption">Bloc jument</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mare-name">Nom de la jument</Label>
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
              <Label htmlFor="mare-faras">Numero FARAS</Label>
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
              <Label>Centre</Label>
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
                  <SelectValue placeholder="Selectionner un centre" />
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
              <Label>Saison</Label>
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
              <Label>Race</Label>
              <Select
                value={form.mare.breed}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, breed: value },
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
              <Label htmlFor="mare-birth-date">Date naissance jument</Label>
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
              <Label htmlFor="mare-bcs">BCS jument / 5</Label>
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
              <Select
                value={form.mare.admissionStatus}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: {
                      ...currentValue.mare,
                      admissionStatus: value as MareDraft["admissionStatus"],
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acceptee">Acceptee</SelectItem>
                  <SelectItem value="refusee">Refusee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mare-owner">Proprietaire</Label>
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
              <Label htmlFor="mare-commune">Commune</Label>
              <Input
                id="mare-commune"
                value={form.mare.commune}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, commune: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Statut physiologique</Label>
              <Select
                value={form.mare.physiologicalStatus}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    mare: { ...currentValue.mare, physiologicalStatus: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {physiologicalStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.mare.admissionStatus === "refusee" ? (
            <div className="mt-5 space-y-2">
              <Label htmlFor="mare-refusal">Motif de refus</Label>
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
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-border bg-white/70 p-5">
          <p className="section-caption">Bloc reproduction</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Etalon</Label>
              <Select
                value={form.reproduction.stallion}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      stallion: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stallionOptions.map((stallion) => (
                    <SelectItem key={stallion} value={stallion}>
                      {stallion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stallion-faras">N FARAS de l etalon</Label>
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
              <Label htmlFor="stallion-birth-date">Date de naissance de l etalon</Label>
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
              <Label>Race de l etalon</Label>
              <Select
                value={form.reproduction.stallionBreed}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      stallionBreed: value,
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
              <Label>Categorie etalon</Label>
              <Select
                value={form.reproduction.stallionCategory}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      stallionCategory: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stallionCategoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type de saillie</Label>
              <Select
                value={form.reproduction.matingType}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      matingType: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {matingTypeOptions.map((matingType) => (
                    <SelectItem key={matingType} value={matingType}>
                      {matingType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cycle-1">Date cycle 1</Label>
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
              <Label>Diagnostic</Label>
              <Select
                value={form.reproduction.diagnosis}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      diagnosis: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {diagnosisOptions.map((diagnosis) => (
                    <SelectItem key={diagnosis} value={diagnosis}>
                      {diagnosis}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dps-number">N DPS</Label>
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
              <Label>Saisie sur FARAS</Label>
              <Select
                value={form.reproduction.farasEntryStatus}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      farasEntryStatus: value as ReproductionDraft["farasEntryStatus"],
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
              <Label htmlFor="latest-finding">Dernier constat</Label>
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
            {form.reproduction.farasEntryStatus === "NON" ? (
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="faras-reason">Cause (si NON)</Label>
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
              <Label htmlFor="prev-sirema">SIREMA produit N-1</Label>
              <Input
                id="prev-sirema"
                value={form.reproduction.previousProductSirema}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    reproduction: {
                      ...currentValue.reproduction,
                      previousProductSirema: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prev-birth">Date naissance produit N-1</Label>
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
              <Label>Sexe produit N-1</Label>
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
                  <SelectItem value="Femelle">Femelle</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Race produit N-1</Label>
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
              <Label>Declaration produit N-1</Label>
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
              <Label>Identification produit N-1</Label>
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

          <div className="mt-5 space-y-2">
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
        </div>

        <div className="rounded-[1.5rem] border border-border bg-muted/30 p-5">
          <p className="section-caption">Contexte de saisie</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground lg:grid-cols-3">
            <p>
              <span className="font-semibold text-slate-950">Centre:</span>{" "}
              {selectedCentre?.name ?? "Non selectionne"}
            </p>
            <p>
              <span className="font-semibold text-slate-950">Saison:</span>{" "}
              {form.mare.season}
            </p>
            <p>
              <span className="font-semibold text-slate-950">Resultat cycle:</span>{" "}
              {form.reproduction.cycleResult}
            </p>
          </div>
        </div>

        {!readOnly ? (
          <div className="flex justify-end">
            <Button onClick={() => onSave(form)}>
              <Save className="h-4 w-4" />
              Enregistrer la reproduction
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
