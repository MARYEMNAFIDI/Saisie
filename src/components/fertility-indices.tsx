"use client";

import { Info } from "lucide-react";

import { isPositiveGestationDiagnosis } from "@/data/mockRecords";
import { MareRecord, ProductRecord, ReproductionRecord } from "@/types/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const normalizeText = (value: string) =>
  value
    .trim()
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

const getRecordTime = (record: ReproductionRecord) =>
  new Date(record.updatedAt || record.createdAt).getTime();

const getStallionLabel = (record: ReproductionRecord) =>
  record.stallion.trim() || "Étalon non renseigné";

const isDeclaredAbortion = (record: ReproductionRecord) => {
  const normalizedDiagnosis = normalizeText(record.diagnosis);
  return record.abortion || normalizedDiagnosis === "av" || normalizedDiagnosis === "avortement";
};

const getDiagnosisBucket = (diagnosis: string): "positive" | "negative" | "unknown" => {
  const normalizedDiagnosis = normalizeText(diagnosis);

  if (!normalizedDiagnosis) {
    return "unknown";
  }

  if (isPositiveGestationDiagnosis(diagnosis)) {
    return "positive";
  }

  if (
    normalizedDiagnosis === "av" ||
    normalizedDiagnosis === "avortement" ||
    normalizedDiagnosis === "v" ||
    normalizedDiagnosis === "vide" ||
    normalizedDiagnosis === "sr" ||
    normalizedDiagnosis === "saillie repetee" ||
    normalizedDiagnosis === "re" ||
    normalizedDiagnosis.includes("resorption") ||
    normalizedDiagnosis.includes("retour en chaleur") ||
    normalizedDiagnosis.includes("negative")
  ) {
    return "negative";
  }

  return "unknown";
};

const InfoTooltip = ({
  title,
  children,
}: {
  title: string;
  children: string;
}) => (
  <div className="group relative inline-flex">
    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition-colors group-hover:border-slate-400 group-hover:text-slate-700">
      <Info className="h-3.5 w-3.5" />
    </div>
    <div className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-72 -translate-x-1/2 rounded-2xl bg-slate-950 px-4 py-3 text-left text-xs leading-5 text-white shadow-xl group-hover:block">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-white/80">{children}</p>
    </div>
  </div>
);

const MetricCard = ({
  title,
  value,
  caption,
  tooltip,
  toneClassName,
}: {
  title: string;
  value: string;
  caption: string;
  tooltip: string;
  toneClassName: string;
}) => (
  <div className={`rounded-[1.5rem] px-5 py-6 shadow-sm ${toneClassName}`}>
    <div className="flex items-center gap-2">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <InfoTooltip title={title}>{tooltip}</InfoTooltip>
    </div>
    <p className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
    <p className="mt-3 text-sm leading-6 text-slate-600">{caption}</p>
  </div>
);

export const FertilityIndices = ({
  mares,
  reproductions,
  products,
}: {
  mares: MareRecord[];
  reproductions: ReproductionRecord[];
  products: ProductRecord[];
}) => {
  const recordsByMareSeason = new Map<string, ReproductionRecord[]>();

  reproductions.forEach((record) => {
    const key = `${record.mareId}::${record.season}`;
    const currentGroup = recordsByMareSeason.get(key) ?? [];
    currentGroup.push(record);
    recordsByMareSeason.set(key, currentGroup);
  });

  let totalFertileCycles = 0;
  let totalNonFertileCycles = 0;
  let totalMaresServed = 0;
  let totalFullMares = 0;
  let totalUnknownMares = 0;
  let totalDeclaredAbortions = 0;

  const mareSeasonStallionMap = new Map<
    string,
    {
      stallions: string[];
      finalStallion: string | null;
    }
  >();

  recordsByMareSeason.forEach((records, mareSeasonKey) => {
    const latestByStallion = new Map<string, ReproductionRecord>();
    const orderedRecords = [...records].sort((a, b) => getRecordTime(b) - getRecordTime(a));

    orderedRecords.forEach((record) => {
      const stallion = getStallionLabel(record);
      if (!latestByStallion.has(stallion)) {
        latestByStallion.set(stallion, record);
      }
    });

    const latestRecords = [...latestByStallion.values()].sort(
      (a, b) => getRecordTime(b) - getRecordTime(a),
    );
    const finalRecord = latestRecords[0] ?? null;
    const finalStallion = finalRecord ? getStallionLabel(finalRecord) : null;

    mareSeasonStallionMap.set(mareSeasonKey, {
      stallions: latestRecords.map((record) => getStallionLabel(record)),
      finalStallion,
    });

    latestRecords.forEach((record) => {
      totalMaresServed += 1;
      totalFertileCycles += Math.max(record.fertileCycles ?? 0, 0);
      totalNonFertileCycles += Math.max(record.nonFertileCycles ?? 0, 0);

      if (isDeclaredAbortion(record)) {
        totalDeclaredAbortions += 1;
      }

      if (finalStallion && getStallionLabel(record) !== finalStallion) {
        return;
      }

      const diagnosisBucket = getDiagnosisBucket(record.diagnosis);
      if (diagnosisBucket === "positive") {
        totalFullMares += 1;
      } else if (diagnosisBucket === "unknown") {
        totalUnknownMares += 1;
      }
    });
  });

  const declaredProducts = products.filter((product) => product.declaration === "Declaree");
  let totalDeclaredBirths = 0;
  let ambiguousBirths = 0;
  let unlinkedBirths = 0;

  declaredProducts.forEach((product) => {
    const mareSeasonKey = `${product.mareId}::${product.season}`;
    const summary = mareSeasonStallionMap.get(mareSeasonKey);

    if (!summary) {
      unlinkedBirths += 1;
      return;
    }

    if (summary.stallions.length !== 1 || !summary.finalStallion) {
      ambiguousBirths += 1;
      return;
    }

    totalDeclaredBirths += 1;
  });

  const totalKnownCycles = totalFertileCycles + totalNonFertileCycles;
  const cycleFertility =
    totalKnownCycles > 0 ? computeRatio(totalFertileCycles, totalKnownCycles) : null;
  const endSeasonFertility =
    totalMaresServed > 0 && cycleFertility !== null
      ? ((totalFullMares + totalUnknownMares) * cycleFertility) / totalMaresServed
      : null;

  const visibleSeasons = [...new Set(mares.map((mare) => mare.season).filter(Boolean))].sort();

  const remarks: string[] = [];

  if (totalKnownCycles > 0 && totalKnownCycles < 20) {
    remarks.push(
      "La fertilité par cycle reste fragile tant que moins de 20 cycles connus sont renseignés.",
    );
  }

  if (totalMaresServed > 0) {
    const knownMares = totalMaresServed - totalUnknownMares;
    const unknownShare = totalUnknownMares / totalMaresServed;
    if (knownMares < 10 || unknownShare >= 0.3) {
      remarks.push(
        "La fertilité fin de saison demande au moins 10 juments renseignées et moins de 30 % de juments sans renseignement.",
      );
    }
  }

  if (visibleSeasons.length < 2 || ambiguousBirths > 0 || unlinkedBirths > 0) {
    remarks.push(
      "La fertilité apparente n'est pas totalement fiabilisée ici: il manque une vraie base N-1 et une liaison directe naissance/saillie/étalon.",
    );
  }

  return (
    <Card className="mx-auto w-full max-w-6xl border-white/80 bg-white/90">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-semibold text-slate-950">Fertilité</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-3">
          <MetricCard
            title="Fertilité par cycle"
            value={cycleFertility === null ? "Non calculée" : toPercent(cycleFertility)}
            caption={`${totalFertileCycles} cycle(s) fécondé(s) et ${totalNonFertileCycles} non fécondé(s).`}
            tooltip="Calcul: nombre de cycles fécondés × 100 / (nombre de cycles fécondés + nombre de cycles non fécondés). Les cycles sans renseignement ne sont pas exploités."
            toneClassName="bg-[linear-gradient(145deg,rgba(240,249,255,0.98),rgba(224,242,254,0.78))]"
          />

          <MetricCard
            title="Fertilité fin de saison"
            value={endSeasonFertility === null ? "Non calculée" : toPercent(endSeasonFertility)}
            caption={`${totalFullMares} jument(s) pleine(s), ${totalUnknownMares} sans renseignement, ${totalMaresServed} saillie(s).`}
            tooltip="Calcul: ((nombre de juments pleines + nombre de juments sans renseignement) × fertilité par cycle) / nombre de juments saillies. En cas de changement d'étalon, le dernier étalon garde le statut final."
            toneClassName="bg-[linear-gradient(145deg,rgba(240,253,244,0.98),rgba(220,252,231,0.8))]"
          />

          <MetricCard
            title="Fertilité apparente"
            value="À fiabiliser"
            caption={`${totalDeclaredBirths} naissance(s) attribuable(s), ${totalDeclaredAbortions} avortement(s), ${ambiguousBirths + unlinkedBirths} cas à vérifier.`}
            tooltip="Méthode métier cible: (nombre de naissances déclarées + nombre d'avortements déclarés) × 100 / nombre de juments saillies N-1. Cet indice demande une vraie base N-1 et une liaison directe entre naissance, saillie et étalon."
            toneClassName="bg-[linear-gradient(145deg,rgba(255,251,235,0.98),rgba(254,243,199,0.82))]"
          />
        </div>

        {remarks.length > 0 ? (
          <div className="rounded-[1.5rem] bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
              Remarques
            </p>
            <div className="mt-3 space-y-2">
              {remarks.map((remark) => (
                <p key={remark}>{remark}</p>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
