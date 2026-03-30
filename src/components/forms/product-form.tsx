"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import {
  breedOptions,
  formatProductStatusLabel,
  productStatusOptions,
  seasonOptions,
} from "@/data/mockRecords";
import { MareRecord, ProductRecord } from "@/types/domain";

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

const productSexOptions = ["Femelle", "Male"] as const;
const declarationOptions = ["Declaree", "Non declaree"] as const;
const identificationOptions = ["Identifie", "En attente"] as const;

const productSexLabels: Record<(typeof productSexOptions)[number], string> = {
  Femelle: "Femelle",
  Male: "Mâle",
};

const declarationLabels: Record<(typeof declarationOptions)[number], string> = {
  Declaree: "Déclarée",
  "Non declaree": "Non déclarée",
};

const identificationLabels: Record<(typeof identificationOptions)[number], string> = {
  Identifie: "Identifié",
  "En attente": "En attente",
};

export type ProductDraft = Omit<
  ProductRecord,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
> &
  Partial<Pick<ProductRecord, "id">>;

export const createEmptyProductDraft = (
  harasId: string,
  mare?: MareRecord,
): ProductDraft => ({
  mareId: mare?.id ?? "",
  harasId,
  centreId: mare?.centreId ?? "",
  season: mare?.season ?? "2026",
  previousProduct: "",
  siremaProduct: "",
  birthDate: "",
  sex: "Femelle",
  breed: mare?.breed ?? breedOptions[0],
  declaration: "Declaree",
  identification: "En attente",
  productStatus: "Declare",
});

export const ProductForm = ({
  initialValue,
  mareOptions,
  readOnly,
  onSave,
}: {
  initialValue: ProductDraft;
  mareOptions: MareRecord[];
  readOnly: boolean;
  onSave: (draft: ProductDraft) => void;
}) => {
  const [form, setForm] = useState<ProductDraft>(initialValue);

  useEffect(() => {
    setForm(initialValue);
  }, [initialValue]);

  const selectedMare = mareOptions.find((mare) => mare.id === form.mareId);

  return (
    <Card className="mx-auto w-full max-w-6xl border-white/80 bg-white/85">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-caption">Déclaration de naissance</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Déclarer une naissance
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Saisissez ici les informations essentielles de la naissance.
            </p>
          </div>
          <Badge variant={readOnly ? "warning" : "success"}>
            {readOnly ? "Consultation" : "Edition active"}
          </Badge>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-slate-50/70 p-5">
          <p className="section-caption">Indispensable</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Jument</Label>
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
                    breed: mare?.breed ?? currentValue.breed,
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
              <Label htmlFor="birth-date">Date de naissance</Label>
              <Input
                id="birth-date"
                type="date"
                value={form.birthDate}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    birthDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Sexe</Label>
              <SelectWithOther
                value={form.sex}
                options={productSexOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser un autre sexe"
                renderOptionLabel={(option) =>
                  productSexLabels[option as (typeof productSexOptions)[number]]
                }
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    sex: value as ProductDraft["sex"],
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Déclaration</Label>
              <SelectWithOther
                value={form.declaration}
                options={declarationOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser une autre déclaration"
                renderOptionLabel={(option) =>
                  declarationLabels[option as (typeof declarationOptions)[number]]
                }
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    declaration: value as ProductDraft["declaration"],
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Identification</Label>
              <SelectWithOther
                value={form.identification}
                options={identificationOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser une autre identification"
                renderOptionLabel={(option) =>
                  identificationLabels[option as (typeof identificationOptions)[number]]
                }
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    identification: value as ProductDraft["identification"],
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <SelectWithOther
                value={form.productStatus}
                options={productStatusOptions}
                disabled={readOnly}
                otherPlaceholder="Préciser un autre statut"
                renderOptionLabel={formatProductStatusLabel}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    productStatus: value as ProductDraft["productStatus"],
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="previous-product">Produit precedent</Label>
              <Input
                id="previous-product"
                value={form.previousProduct}
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    previousProduct: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sirema-product">Reference SIREMA</Label>
              <Input
                id="sirema-product"
                value={form.siremaProduct}
                placeholder="Ex: 20101307C"
                disabled={readOnly}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    siremaProduct: event.target.value.toUpperCase().replace(/\s+/g, ""),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Race</Label>
              <SelectWithOther
                value={form.breed}
                options={breedOptions}
                disabled={readOnly}
                otherPlaceholder="Saisir une autre race"
                onValueChange={(value) =>
                  setForm((currentValue) => ({ ...currentValue, breed: value }))
                }
              />
            </div>
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
          </div>
        </div>

        {selectedMare ? (
          <div className="rounded-[1.5rem] border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            <p className="section-caption">Jument selectionnee</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <p>
                <span className="font-semibold text-slate-950">Nom:</span> {selectedMare.name}
              </p>
              <p>
                <span className="font-semibold text-slate-950">FARAS:</span>{" "}
                {selectedMare.farasNumber}
              </p>
              <p>
                <span className="font-semibold text-slate-950">Proprietaire:</span>{" "}
                {selectedMare.owner}
              </p>
            </div>
          </div>
        ) : null}

        {!readOnly ? (
          <div className="flex justify-end">
            <Button onClick={() => onSave(form)}>
              <Save className="h-4 w-4" />
              Enregistrer la déclaration
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
