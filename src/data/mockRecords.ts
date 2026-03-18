import { MareRecord, ProductRecord, ReproductionRecord } from "@/types/domain";

export const seasonOptions = ["2024-2025", "2025-2026", "2026-2027"];

export const breedOptions = [
  "Barbe",
  "Arabe-Barbe",
  "Pur-sang arabe",
  "Cheval de selle",
  "Muletiere",
];

export const physiologicalStatusOptions = [
  "Vide",
  "AV",
  "Suitee",
  "Repos",
  "Maiden",
];

export const matingTypeOptions = [
  "Monte naturelle",
  "Insemination artificielle fraiche",
  "Insemination artificielle refrigeree",
];

export const diagnosisOptions = ["AV", "PP", "SR", "V", "MB", "RE"];

export const productStatusOptions = ["Declare", "En attente", "A confirmer"];

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

export const initialMareRecords: MareRecord[] = [];

export const initialReproductionRecords: ReproductionRecord[] = [];

export const initialProductRecords: ProductRecord[] = [];

export const initialDatabase = {
  mares: initialMareRecords,
  reproductions: initialReproductionRecords,
  products: initialProductRecords,
};
