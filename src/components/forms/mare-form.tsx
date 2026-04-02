"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import {
  breedOptions,
  formatPhysiologicalStatusLabel,
  physiologicalStatusOptions,
  seasonOptions,
} from "@/data/mockRecords";
import { Centre, MareRecord } from "@/types/domain";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MareDigitalSheet } from "@/components/forms/mare-digital-sheet";
import { SelectWithOther } from "@/components/forms/select-with-other";
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

const admissionStatusOptions = ["acceptee", "refusee"] as const;
const admissionStatusLabels: Record<(typeof admissionStatusOptions)[number], string> = {
  acceptee: "Acceptée",
  refusee: "Refusée",
};

export type MareDraft = Omit<
  MareRecord,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
> &
  Partial<Pick<MareRecord, "id">>;

export const createEmptyMareDraft = (
  harasId: string,
  centreId?: string,
): MareDraft => ({
  harasId,
  centreId: centreId ?? "",
  season: "2026",
  name: "",
  farasNumber: "",
  transponderNumber: "",
  breed: breedOptions[0],
  birthDate: "",
  coat: "",
  stallionPrimary: "",
  stallionSecondary: "",
  owner: "",
  phone: "",
  commune: "",
  breedingAddress: "",
  history: "",
  weightKg: "",
  physiologicalStatus: physiologicalStatusOptions[0],
  bcs: "",
  vulvaConformation: "",
  admissionStatus: "acceptee",
  refusalReason: "",
});

const updateField = <K extends keyof MareDraft>(
  currentValue: MareDraft,
  key: K,
  value: MareDraft[K],
) => ({
  ...currentValue,
  [key]: value,
});

export const MareForm = ({
  initialValue,
  centres,
  harasLabel,
  readOnly,
  isSaving = false,
  onSave,
}: {
  initialValue: MareDraft;
  centres: Centre[];
  harasLabel: string;
  readOnly: boolean;
  isSaving?: boolean;
  onSave: (draft: MareDraft) => void | Promise<void>;
}) => {
  const [form, setForm] = useState<MareDraft>(initialValue);

  useEffect(() => {
    setForm(initialValue);
  }, [initialValue]);

  return (
    <Card className="mx-auto w-full max-w-6xl border-border/70 bg-card/85 dark:bg-card/92">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-caption">Fiche jument</p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              {form.id ? "Mettre à jour la fiche" : "Nouvelle fiche"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Commencez par les champs indispensables. Les informations complémentaires
              restent disponibles plus bas.
            </p>
          </div>
          <Badge variant={readOnly ? "warning" : "success"}>
            {readOnly ? "Lecture seule" : "Édition active"}
          </Badge>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-muted/35 p-5 dark:bg-muted/20">
          <p className="section-caption">Indispensable</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mare-name" required>
                Nom de la jument
              </Label>
              <Input
                id="mare-name"
                value={form.name}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) =>
                    updateField(currentValue, "name", event.target.value),
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faras-number" required>
                Numéro FARAS
              </Label>
              <Input
                id="faras-number"
                value={form.farasNumber}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) =>
                    updateField(currentValue, "farasNumber", event.target.value),
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Centre</Label>
              <Select
                value={form.centreId}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => updateField(currentValue, "centreId", value))
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
                value={form.breed}
                options={breedOptions}
                disabled={readOnly}
                otherPlaceholder="Saisir une autre race"
                onValueChange={(value) =>
                  setForm((currentValue) => updateField(currentValue, "breed", value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner" required>
                Propriétaire
              </Label>
              <Input
                id="owner"
                value={form.owner}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) =>
                    updateField(currentValue, "owner", event.target.value),
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Admission</Label>
              <SelectWithOther
                value={form.admissionStatus}
                options={admissionStatusOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser un autre statut d'admission"
                renderOptionLabel={(option) =>
                  admissionStatusLabels[option as (typeof admissionStatusOptions)[number]]
                }
                onValueChange={(value) =>
                  setForm((currentValue) =>
                    updateField(
                      currentValue,
                      "admissionStatus",
                      value as MareDraft["admissionStatus"],
                    ),
                  )
                }
              />
            </div>
          </div>

          {form.admissionStatus === "refusee" ? (
            <div className="mt-5 rounded-[1.25rem] border border-rose-200 bg-rose-50/80 p-4 dark:border-rose-500/30 dark:bg-rose-500/12">
              <div className="space-y-2">
                <Label htmlFor="refusal-reason" required>
                  Motif de refus
                </Label>
                <p className="text-sm text-rose-700 dark:text-rose-200">
                  Si la jument est refusee, indiquez ici la raison du refus.
                </p>
                <Textarea
                  id="refusal-reason"
                  value={form.refusalReason}
                  disabled={readOnly}
                  onChange={(event) =>
                    setForm((currentValue) =>
                      updateField(currentValue, "refusalReason", event.target.value),
                    )
                  }
                  placeholder="Ex: age non conforme, etat sanitaire, dossier incomplet..."
                />
              </div>
            </div>
          ) : null}
        </div>

        <details className="rounded-[1.5rem] border border-border bg-card/60 p-5 dark:bg-card/35">
          <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
            Informations complémentaires
          </summary>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="birth-date" required>
                Date de naissance
              </Label>
              <Input
                id="birth-date"
                type="date"
                value={form.birthDate}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) =>
                    updateField(currentValue, "birthDate", event.target.value),
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Statut physiologique</Label>
              <SelectWithOther
                value={form.physiologicalStatus}
                options={physiologicalStatusOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser un autre statut physiologique"
                renderOptionLabel={formatPhysiologicalStatusLabel}
                onValueChange={(value) =>
                  setForm((currentValue) =>
                    updateField(currentValue, "physiologicalStatus", value),
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bcs" required>
                BCS
              </Label>
              <Input
                id="bcs"
                value={form.bcs}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) =>
                    updateField(currentValue, "bcs", event.target.value),
                  )
                }
                placeholder="Ex. 3/5"
              />
            </div>
            <div className="space-y-2">
              <Label required>Saison</Label>
              <Select
                value={form.season}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => updateField(currentValue, "season", value))
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
          </div>
        </details>

        <div className="rounded-[1.5rem] border border-border bg-muted/30 p-5">
          <p className="section-caption">Contexte de saisie</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground lg:grid-cols-3">
            <p>
              <span className="font-semibold text-foreground">Haras:</span> {harasLabel}
            </p>
            <p>
              <span className="font-semibold text-foreground">Centre:</span>{" "}
              {centres.find((centre) => centre.id === form.centreId)?.name ?? "Non selectionne"}
            </p>
            <p>
              <span className="font-semibold text-foreground">Saison:</span> {form.season}
            </p>
          </div>
        </div>

        <MareDigitalSheet
          form={form}
          centres={centres}
          harasLabel={harasLabel}
        />

        {!readOnly ? (
          <div className="flex justify-end">
            <Button disabled={isSaving} onClick={() => void onSave(form)}>
              <Save className="h-4 w-4" />
              {isSaving ? "Enregistrement..." : "Enregistrer la fiche"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
