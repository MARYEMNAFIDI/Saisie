"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { breedOptions, seasonOptions } from "@/data/mockRecords";
import { MareRecord, ProductRecord } from "@/types/domain";

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
  season: mare?.season ?? "2025-2026",
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
            <p className="section-caption">Production</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Declarer une production
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              La naissance est saisie separement dans ce formulaire de production.
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
                  <SelectValue placeholder="Selectionner une jument" />
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
              <Select
                value={form.sex}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    sex: value as ProductDraft["sex"],
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
              <Label>Declaration</Label>
              <Select
                value={form.declaration}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    declaration: value as ProductDraft["declaration"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Declaree">Declaree</SelectItem>
                  <SelectItem value="Non declaree">Non declaree</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Identification</Label>
              <Select
                value={form.identification}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    identification: value as ProductDraft["identification"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Identifie">Identifie</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut production</Label>
              <Select
                value={form.productStatus}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    productStatus: value as ProductDraft["productStatus"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Declare">Declare</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="A confirmer">A confirmer</SelectItem>
                </SelectContent>
              </Select>
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
              <Select
                value={form.breed}
                disabled={readOnly}
                onValueChange={(value) =>
                  setForm((currentValue) => ({ ...currentValue, breed: value }))
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
              Enregistrer la production
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
