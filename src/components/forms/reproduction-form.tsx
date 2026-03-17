"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import {
  breedOptions,
  diagnosisOptions,
  matingTypeOptions,
  seasonOptions,
  stallionOptions,
} from "@/data/mockRecords";
import { MareRecord, ReproductionRecord } from "@/types/domain";

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

export type ReproductionDraft = Omit<
  ReproductionRecord,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
> &
  Partial<Pick<ReproductionRecord, "id">>;

export const createEmptyReproductionDraft = (
  harasId: string,
  mare?: MareRecord,
): ReproductionDraft => ({
  mareId: mare?.id ?? "",
  harasId,
  centreId: mare?.centreId ?? "",
  season: mare?.season ?? "2025-2026",
  stallion: stallionOptions[0],
  stallionFarasNumber: "",
  stallionBirthDate: "",
  stallionBreed: breedOptions[0],
  stallionCategory: "National (SOREC)",
  matingType: matingTypeOptions[0],
  firstCycleDate: "",
  secondCycleDate: "",
  thirdCycleDate: "",
  fourthCycleDate: "",
  totalCycles: 1,
  cycleResult: "",
  diagnosis: diagnosisOptions[0],
  dpsNumber: "",
  farasEntryStatus: "OUI",
  farasEntryReason: "",
  previousProductSirema: "",
  previousProductBirthDate: "",
  previousProductSex: "Femelle",
  previousProductBreed: breedOptions[0],
  previousProductDeclaration: "NON",
  previousProductIdentification: "NON",
  heatReturn: false,
  abortion: false,
  embryoResorption: false,
  latestFinding: "",
  observations: "",
});

export const ReproductionForm = ({
  initialValue,
  mareOptions,
  readOnly,
  onSave,
}: {
  initialValue: ReproductionDraft;
  mareOptions: MareRecord[];
  readOnly: boolean;
  onSave: (draft: ReproductionDraft) => void;
}) => {
  const [form, setForm] = useState<ReproductionDraft>(initialValue);

  useEffect(() => {
    setForm(initialValue);
  }, [initialValue]);

  const selectedMare = mareOptions.find((mare) => mare.id === form.mareId);

  return (
    <Card className="border-white/80 bg-white/85">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-caption">Suivi reproduction</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Enregistrer un suivi
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Remplissez d'abord les informations les plus utiles. Le reste peut être
              ajouté dans la partie complémentaire.
            </p>
          </div>
          <Badge variant={readOnly ? "warning" : "success"}>
            {readOnly ? "Consultation" : "Saisie active"}
          </Badge>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-slate-50/70 p-5">
          <p className="section-caption">Indispensable</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Jument concernée</Label>
              <Select
                value={form.mareId}
                disabled={readOnly}
                onValueChange={(value) => {
                  const mare = mareOptions.find((item) => item.id === value);
                  setForm((currentValue) => ({
                    ...currentValue,
                    mareId: value,
                    centreId: mare?.centreId ?? currentValue.centreId,
                    season: mare?.season ?? currentValue.season,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une jument" />
                </SelectTrigger>
                <SelectContent>
                  {mareOptions.map((mare) => (
                    <SelectItem key={mare.id} value={mare.id}>
                      {mare.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Etalon</Label>
              <Select
                value={form.stallion}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({ ...currentValue, stallion: value }))
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
              <Label>Type de saillie</Label>
              <Select
                value={form.matingType}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({ ...currentValue, matingType: value }))
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
              <Label htmlFor="firstCycleDate">Date du cycle</Label>
              <Input
                id="firstCycleDate"
                type="date"
                value={form.firstCycleDate}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    firstCycleDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Diagnostic</Label>
              <Select
                value={form.diagnosis}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({ ...currentValue, diagnosis: value }))
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
              <Label htmlFor="latest-finding">Dernier constat</Label>
              <Input
                id="latest-finding"
                value={form.latestFinding}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    latestFinding: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {selectedMare ? (
          <div className="rounded-[1.5rem] border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            <p className="section-caption">Jument sélectionnée</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <p>
                <span className="font-semibold text-slate-950">Nom:</span> {selectedMare.name}
              </p>
              <p>
                <span className="font-semibold text-slate-950">Commune:</span>{" "}
                {selectedMare.commune}
              </p>
              <p>
                <span className="font-semibold text-slate-950">Saison:</span>{" "}
                {selectedMare.season}
              </p>
            </div>
          </div>
        ) : null}

        <details className="rounded-[1.5rem] border border-border bg-white/70 p-5">
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
            Informations complémentaires
          </summary>

          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Saison</Label>
              <Select
                value={form.season}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({ ...currentValue, season: value }))
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

            {[
              ["secondCycleDate", "Date 2e cycle"],
              ["thirdCycleDate", "Date 3e cycle"],
              ["fourthCycleDate", "Date 4e cycle"],
            ].map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type="date"
                  value={form[key as keyof ReproductionDraft] as string}
                  disabled={readOnly}
                  onChange={(event) =>
                    setForm((currentValue) => ({
                      ...currentValue,
                      [key]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="total-cycles">Nombre total de cycles</Label>
              <Input
                id="total-cycles"
                type="number"
                min={1}
                max={4}
                value={form.totalCycles}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    totalCycles: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cycle-result">Resultat du cycle</Label>
              <Input
                id="cycle-result"
                value={form.cycleResult}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    cycleResult: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-2">
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                value={form.observations}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    observations: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-950">Incidents a signaler</p>
              {[
                { key: "heatReturn", label: "Retour en chaleur" },
                { key: "abortion", label: "Avortement" },
                { key: "embryoResorption", label: "Resorption embryonnaire" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm font-medium text-slate-800"
                >
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(form[item.key as keyof ReproductionDraft])}
                    disabled={readOnly}
                    onChange={(event) =>
                      setForm((currentValue) => ({
                        ...currentValue,
                        [item.key]: event.target.checked,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        </details>

        {!readOnly ? (
          <div className="flex justify-end">
            <Button onClick={() => onSave(form)}>
              <Save className="h-4 w-4" />
              Enregistrer le suivi
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
