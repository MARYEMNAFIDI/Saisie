import { MareRecord, ProductRecord, ReproductionRecord } from "@/types/domain";

export const seasonOptions = ["2026"];

export const breedOptions = [
  "Arabe barbe",
  "Pur-sang anglais",
  "Pur-sang arabe",
  "Anglo-arabe",
  "Selle étrangère",
];

export const physiologicalStatusOptions = [
  "Vide",
  "AV",
  "Suitee",
  "Repos",
  "Maiden",
];

export const physiologicalStatusLabels = {
  Vide: "Vide",
  AV: "AV",
  Suitee: "Suitée",
  Repos: "Repos",
  Maiden: "Maiden",
} as const;

export const matingTypeOptions = [
  "Monte naturelle",
  "Insemination artificielle fraiche",
  "Insemination artificielle refrigeree",
];

export const matingTypeLabels = {
  "Monte naturelle": "Monte naturelle",
  "Insemination artificielle fraiche": "Insémination artificielle fraîche",
  "Insemination artificielle refrigeree": "Insémination artificielle réfrigérée",
} as const;

export const diagnosisLabels = {
  AV: "Avortement",
  PP: "Présumée pleine",
  PPP: "Présumée pleine privée",
  SR: "Saillie répétée",
  V: "Vide",
  MB: "Mort-basse",
  RE: "Résorption embryonnaire",
} as const;

export const diagnosisOptions = Object.keys(diagnosisLabels) as Array<
  keyof typeof diagnosisLabels
>;

const normalizeDiagnosisText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const normalizeDiagnosisCode = (diagnosis: string) =>
  diagnosis.trim().toUpperCase() as keyof typeof diagnosisLabels;

export const isPositiveGestationDiagnosis = (diagnosis: string) => {
  const normalizedDiagnosis = normalizeDiagnosisText(diagnosis);
  return (
    normalizedDiagnosis.includes("gestante") ||
    normalizedDiagnosis.includes("confirme") ||
    normalizedDiagnosis.includes("positive") ||
    normalizedDiagnosis.includes("presumee pleine") ||
    normalizedDiagnosis.includes("pleine presumee") ||
    normalizedDiagnosis === "pp" ||
    normalizedDiagnosis === "ppp" ||
    normalizedDiagnosis === "mb"
  );
};

export const getDiagnosisLabel = (diagnosis: string) => {
  const normalizedDiagnosis = normalizeDiagnosisCode(diagnosis);
  return diagnosisLabels[normalizedDiagnosis] ?? diagnosis;
};

export const formatDiagnosisLabel = (diagnosis: string) => {
  const normalizedDiagnosis = normalizeDiagnosisCode(diagnosis);
  if (!normalizedDiagnosis) {
    return "";
  }

  const label = diagnosisLabels[normalizedDiagnosis];
  return label ? `${normalizedDiagnosis} - ${label}` : diagnosis;
};

export const productStatusOptions = ["Declare", "En attente", "A confirmer"];

export const productStatusLabels = {
  Declare: "Déclaré",
  "En attente": "En attente",
  "A confirmer": "À confirmer",
} as const;

export const reproductionIncidentOptions = [
  { key: "heatReturn", label: "Retour en chaleur" },
  { key: "abortion", label: "Avortement" },
  { key: "embryoResorption", label: "Resorption embryonnaire" },
  { key: "nonOvulation", label: "Non-ovulation" },
  { key: "uterineInfection", label: "Infection uterine" },
  { key: "twinPregnancy", label: "Gestation gemellaire" },
  { key: "traumaticAccident", label: "Accident traumatique" },
] as const;

const stallionsByHaras: Record<string, string[]> = {
  meknes: [
    "RUSSIAN CROSS**",
    "STYLE VENDOME**",
    "AL NOURY",
    "KHATAAB",
    "SCISSOR KICK (KHEMISSET)",
    "METRAG (KHEMISSET)",
    "MONFARID (MRIRT)",
    "JAYIDE AL BORAQ (MRIRT)",
    "AKIM DE DUCOR (KHENIFRA)",
  ],
  oujda: [
    "AF MATHMOON",
    "AL AMYR (TIOULI)",
    "ZIKREET (GUENFOUDA)",
  ],
  marrakech: ["REDA"],
  "el-jadida": [
    "HERMIVAL",
    "EXCELEBRATION",
    "CANNOCK CHASE**",
    "BARNAMAJ",
    "ECLIPSE DU SOLEIL",
    "ALFRED BOGARD AA50%",
    "SOHRAWARDI AA25%",
    "SALAMARASALMAA AA50%",
    "LEEMON OF GRINE AA50%",
    "HOPEWELL AA25%",
    "THAMEV AA25%",
    "FIRSTNLASS ZEMMOUR AA50%",
  ],
  bouznika: ["SEAHENGE", "PENNY'S PICNIC", "SIVIT AL MAURY", "ASRAA MIN AL BARQ"],
};

export const sharedFrozenSemenStallions = [
  "AMENHEMAT (Semence congelee)",
  "MOUNJARED AL CHAM (Semence congelee)",
];

const dedupe = (values: string[]) => Array.from(new Set(values));

const allHarasStallions = dedupe(Object.values(stallionsByHaras).flat());

export const getStallionOptionsForHaras = (harasId?: string) => {
  const scopedStallions = harasId ? stallionsByHaras[harasId] ?? [] : allHarasStallions;
  return dedupe([...scopedStallions, ...sharedFrozenSemenStallions]);
};

export const stallionOptions = getStallionOptionsForHaras();

export const formatPhysiologicalStatusLabel = (status: string) =>
  physiologicalStatusLabels[status as keyof typeof physiologicalStatusLabels] ?? status;

export const formatMatingTypeLabel = (matingType: string) =>
  matingTypeLabels[matingType as keyof typeof matingTypeLabels] ?? matingType;

export const formatProductStatusLabel = (status: string) =>
  productStatusLabels[status as keyof typeof productStatusLabels] ?? status;

export const formatStallionChoiceLabel = (stallion: string) =>
  stallion.replaceAll("Semence congelee", "Semence congelée");

export const initialMareRecords: MareRecord[] = [];

export const initialReproductionRecords: ReproductionRecord[] = [];

export const initialProductRecords: ProductRecord[] = [];

export const initialDatabase = {
  mares: initialMareRecords,
  reproductions: initialReproductionRecords,
  products: initialProductRecords,
};
