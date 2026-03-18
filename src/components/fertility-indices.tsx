"use client";

import { MareRecord, ProductRecord, ReproductionRecord } from "@/types/domain";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const toPercent = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value)} %`;

const computeRatio = (numerator: number, denominator: number) =>
  denominator > 0 ? (numerator / denominator) * 100 : 0;

export const FertilityIndices = ({
  mares,
  reproductions,
  products,
}: {
  mares: MareRecord[];
  reproductions: ReproductionRecord[];
  products: ProductRecord[];
}) => {
  const confirmedGestations = reproductions.filter((record) => {
    const diagnosis = normalizeText(record.diagnosis);
    return (
      diagnosis.includes("gestante") ||
      diagnosis.includes("confirme") ||
      diagnosis.includes("positive") ||
      diagnosis === "pp" ||
      diagnosis === "mb"
    );
  }).length;

  const maresWithProduction = new Set(products.map((record) => record.mareId)).size;

  const conceptionIndex = computeRatio(confirmedGestations, reproductions.length);
  const productionIndex = computeRatio(products.length, reproductions.length);
  const globalFertilityIndex = computeRatio(maresWithProduction, mares.length);

  const metrics = [
    {
      label: "Indice conception",
      value: conceptionIndex,
      hint: `${confirmedGestations} gestations confirmees / ${reproductions.length} suivis`,
      formula: "Indice conception = (Gestations confirmees / Suivis reproduction) x 100",
    },
    {
      label: "Indice production",
      value: productionIndex,
      hint: `${products.length} productions / ${reproductions.length} suivis`,
      formula: "Indice production = (Productions / Suivis reproduction) x 100",
    },
    {
      label: "Indice fertilite globale",
      value: globalFertilityIndex,
      hint: `${maresWithProduction} juments productives / ${mares.length} juments`,
      formula: "Indice fertilite globale = (Juments productives / Juments suivies) x 100",
    },
  ];

  return (
    <Card className="mx-auto w-full max-w-6xl">
      <CardHeader>
        <CardTitle>Fertilite</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[1.25rem] border border-border bg-muted/35 p-4">
          <p className="section-caption">Formules appliquees</p>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
            {metrics.map((metric) => (
              <p key={`formula-${metric.label}`}>{metric.formula}</p>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-[1.25rem] border border-border bg-card/70 p-4"
          >
            <p className="section-caption">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {toPercent(metric.value)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{metric.hint}</p>
          </div>
        ))}
        </div>
      </CardContent>
    </Card>
  );
};
