"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import {
  breedOptions,
  physiologicalStatusOptions,
  seasonOptions,
} from "@/data/mockRecords";
import { Centre, MareRecord } from "@/types/domain";

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
  season: "2025-2026",
  name: "",
  farasNumber: "",
  breed: breedOptions[0],
  birthDate: "",
  owner: "",
  phone: "",
  commune: "",
  physiologicalStatus: physiologicalStatusOptions[0],
  bcs: "",
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
  onSave,
}: {
  initialValue: MareDraft;
  centres: Centre[];
  harasLabel: string;
  readOnly: boolean;
  onSave: (draft: MareDraft) => void;
}) => {
  const [form, setForm] = useState<MareDraft>(initialValue);

  useEffect(() => {
    setForm(initialValue);
  }, [initialValue]);

  return (
    <Card className="mx-auto w-full max-w-6xl border-white/80 bg-white/85">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-caption">Fiche jument</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
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

        <div className="rounded-[1.5rem] border border-border bg-slate-50/70 p-5">
          <p className="section-caption">Indispensable</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mare-name">Nom de la jument</Label>
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
              <Label htmlFor="faras-number">Numéro FARAS</Label>
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
              <Label>Centre</Label>
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
              <Label>Race</Label>
              <Select
                value={form.breed}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => updateField(currentValue, "breed", value))
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
              <Label htmlFor="owner">Propriétaire</Label>
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
              <Label htmlFor="commune">Commune / lieu</Label>
              <Input
                id="commune"
                value={form.commune}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) =>
                    updateField(currentValue, "commune", event.target.value),
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Admission</Label>
              <Select
                value={form.admissionStatus}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) =>
                    updateField(
                      currentValue,
                      "admissionStatus",
                      value as MareDraft["admissionStatus"],
                    ),
                  )
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
          </div>

          {form.admissionStatus === "refusee" ? (
            <div className="mt-5 space-y-2">
              <Label htmlFor="refusal-reason">Motif de refus</Label>
              <Textarea
                id="refusal-reason"
                value={form.refusalReason}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) =>
                    updateField(currentValue, "refusalReason", event.target.value),
                  )
                }
                placeholder="Précisez la raison du refus"
              />
            </div>
          ) : null}
        </div>

        <details className="rounded-[1.5rem] border border-border bg-white/70 p-5">
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
            Informations complémentaires
          </summary>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="birth-date">Date de naissance</Label>
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
              <Label>Statut physiologique</Label>
              <Select
                value={form.physiologicalStatus}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) =>
                    updateField(currentValue, "physiologicalStatus", value),
                  )
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
            <div className="space-y-2">
              <Label htmlFor="bcs">BCS</Label>
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
              <Label>Saison</Label>
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
              <span className="font-semibold text-slate-950">Haras:</span> {harasLabel}
            </p>
            <p>
              <span className="font-semibold text-slate-950">Centre:</span>{" "}
              {centres.find((centre) => centre.id === form.centreId)?.name ?? "Non selectionne"}
            </p>
            <p>
              <span className="font-semibold text-slate-950">Saison:</span> {form.season}
            </p>
          </div>
        </div>

        {!readOnly ? (
          <div className="flex justify-end">
            <Button onClick={() => onSave(form)}>
              <Save className="h-4 w-4" />
              Enregistrer la fiche
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
