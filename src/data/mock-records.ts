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

// Codes demandés pour le champ diagnostic.
export const diagnosisOptions = ["AV", "PP", "SR", "V", "MB", "RE"];

export const productStatusOptions = ["Declare", "En attente", "A confirmer"];

export const stallionOptions = [
  "Al Badi",
  "Mistral Atlas",
  "Nour El Haras",
  "Sirocco Royal",
  "Qaid Meknassi",
];

export const initialMareRecords: MareRecord[] = [];

export const initialReproductionRecords: ReproductionRecord[] = [];

export const initialProductRecords: ProductRecord[] = [];

export const initialDatabase = {
  mares: initialMareRecords,
  reproductions: initialReproductionRecords,
  products: initialProductRecords,
};
