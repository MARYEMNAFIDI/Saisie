import { Centre, CentreType, Haras, SyncStatus } from "@/types/domain";

import { slugify } from "@/lib/utils";

const managers = [
  "A. El Mansouri",
  "S. Berrada",
  "N. Alaoui",
  "R. Amrani",
  "Y. Idrissi",
  "H. Tazi",
  "L. Benjelloun",
];

const syncStatuses: SyncStatus[] = ["synchronise", "surveillance", "prioritaire"];

const deriveCentreType = (name: string): CentreType => {
  if (name.startsWith("Station")) {
    return "station";
  }

  if (name.startsWith("Centre national")) {
    return "national_center";
  }

  return "centre";
};

const extractCityFromCentreName = (name: string, fallback: string) => {
  const lowerName = name.toLowerCase();
  const lastDeIndex = lowerName.lastIndexOf(" de ");
  const lastDApostropheIndex = lowerName.lastIndexOf(" d'");
  const markerIndex = Math.max(lastDeIndex, lastDApostropheIndex);

  if (markerIndex < 0) {
    return fallback;
  }

  const markerLength = markerIndex === lastDApostropheIndex ? 3 : 4;
  const city = name.slice(markerIndex + markerLength).trim();

  return city && city.length > 0 ? city : fallback;
};

const isInseminationCentre = (name: string) => {
  const lowerName = name.toLowerCase();
  return (
    lowerName.includes("insemination") ||
    lowerName.includes("insÃ©mination") ||
    lowerName.includes("insémination")
  );
};

const buildCentreDisplayName = (sourceName: string, fallbackCity: string) => {
  if (isInseminationCentre(sourceName)) {
    return sourceName;
  }

  return `Centre de reproduction équine de ${extractCityFromCentreName(
    sourceName,
    fallbackCity,
  )}`;
};

const createCentre = (
  harasId: string,
  fallbackCity: string,
  name: string,
  harasIndex: number,
  centreIndex: number,
): Centre => ({
  id: `${harasId}-${slugify(name)}`,
  harasId,
  name: buildCentreDisplayName(name, fallbackCity),
  type: deriveCentreType(name),
  region: extractCityFromCentreName(name, fallbackCity),
  manager: managers[(harasIndex + centreIndex) % managers.length],
  activeMares: 14 + ((harasIndex + 2) * 5 + centreIndex * 3) % 31,
  pendingReviews: 1 + ((harasIndex + centreIndex) % 5),
  status: syncStatuses[(harasIndex + centreIndex) % syncStatuses.length],
});

const harasDefinitions = [
  {
    id: "meknes",
    name: "Haras National de Meknès",
    shortName: "Meknès",
    city: "Meknès",
    accessCode: "",
    coverImage: "/haras/meknes.jpg",
    description:
      "Pôle majeur de coordination des stations et centres du plateau central.",
    statusLabel: "Saison ouverte",
    palette: {
      from: "from-emerald-950",
      via: "via-emerald-800",
      to: "to-amber-500",
      glow: "shadow-emerald-950/15",
      ring: "ring-emerald-300/60",
    },
    centres: [
      "Station de monte de Douyet",
      "Station de monte d'Ain Leuh",
      "Station de monte d'Aghbalou",
      "Station de monte d'El Hajeb",
      "Centre de promotion et d'élevage équin de Khénifra",
      "Centre de promotion et d'élevage équin de Tissa",
      "Station de monte de Timahdite",
      "Centre de promotion et d'élevage équin d'Outabouaban",
      "Centre de promotion et d'élevage équin d'Oulmès",
      "Station de monte de Mrirt",
      "Centre de promotion et d'élevage équin de Meknès",
      "Centre de promotion et d'élevage équin de Khémisset",
    ],
  },
  {
    id: "marrakech",
    name: "Haras National de Marrakech",
    shortName: "Marrakech",
    city: "Marrakech",
    accessCode: "",
    coverImage: "/haras/marrakech.png",
    description:
      "Dispositif sud-centre dédié à la saisie des campagnes de monte et de suivi.",
    statusLabel: "Contrôle qualité renforcé",
    palette: {
      from: "from-stone-900",
      via: "via-orange-900",
      to: "to-amber-500",
      glow: "shadow-orange-950/15",
      ring: "ring-orange-300/60",
    },
    centres: [
      "Centre de promotion et d'élevage équin d'Oued Zem",
      "Station de monte de Chemaia",
      "Station de monte d'El Kelaa des Sraghnas",
      "Station de monte de Jemaa Shaim",
      "Centre de promotion et d'élevage équin de Sebt Gzoula",
      "Centre de promotion et d'élevage équin de Marrakech",
      "Centre de promotion et d'élevage équin de Dar Ould Zidouh",
    ],
  },
  {
    id: "oujda",
    name: "Haras National d'Oujda",
    shortName: "Oujda",
    city: "Oujda",
    accessCode: "",
    coverImage: "/haras/oujda.png",
    description:
      "Supervision des stations orientales avec focus sur le suivi de campagne.",
    statusLabel: "Revue prioritaire en cours",
    palette: {
      from: "from-slate-950",
      via: "via-cyan-900",
      to: "to-amber-500",
      glow: "shadow-cyan-950/15",
      ring: "ring-cyan-300/60",
    },
    centres: [
      "Centre de promotion et d'élevage équin d'Oujda",
      "Station de monte de Had Ouled Zbair",
      "Station de monte de Guenfouda",
      "Station de monte d'El Aioun",
      "Station de monte de Tiouli",
      "Station de monte de Taza",
      "Station de monte de Taddart",
      "Station de monte d'Outat El Haj",
      "Station de monte d'Oued Amlil",
      "Centre de promotion et d'élevage équin de Missour",
      "Centre de promotion et d'élevage équin d'Ain Beni Mathar",
      "Centre de promotion et d'élevage équin de Guercif",
    ],
  },
  {
    id: "bouznika",
    name: "Haras National de Bouznika",
    shortName: "Bouznika",
    city: "Bouznika",
    accessCode: "",
    coverImage: "/haras/bouznika.png",
    description:
      "Périmètre côtier à forte cadence, orienté consolidation et suivi de performance.",
    statusLabel: "Synchronisation quotidienne",
    palette: {
      from: "from-blue-950",
      via: "via-sky-800",
      to: "to-amber-500",
      glow: "shadow-blue-950/15",
      ring: "ring-sky-300/60",
    },
    centres: [
      "Centre national d'insémination artificielle équine de Bouznika",
      "Centre de promotion et d'élevage équin de Bouznika",
      "Station de monte de Maaziz",
      "Station de monte d'El Gara",
      "Station de monte de Brachoua",
      "Centre de promotion et d'élevage équin de Ben Slimane",
    ],
  },
  {
    id: "el-jadida",
    name: "Haras National d'El Jadida",
    shortName: "El Jadida",
    city: "El Jadida",
    accessCode: "",
    coverImage: "/haras/el-jadida.jpg",
    description:
      "Dispositif Atlantique avec pilotage de centres, export métier et supervision terrain.",
    statusLabel: "Campagne maîtrisée",
    palette: {
      from: "from-zinc-950",
      via: "via-emerald-900",
      to: "to-amber-500",
      glow: "shadow-zinc-950/15",
      ring: "ring-emerald-300/60",
    },
    centres: [
      "Centre de promotion et d'élevage équin d'El Jadida",
      "Centre de promotion et d'élevage équin de Sidi Bennour",
      "Station de monte de Chtouka",
      "Station de monte de Settat",
      "Station de monte de Sidi Hajjaj",
      "Station de monte d'Oulad Said",
      "Station de monte de Soualem",
      "Station de monte d'Oulad Freij",
      "Station de monte d'Oulad Abbou",
      "Centre de promotion et d'élevage équin de Zemamra",
      "Centre de promotion et d'élevage équin d'Aounate",
    ],
  },
] as const;

export const harasList: Haras[] = harasDefinitions.map((haras, harasIndex) => {
  const centres = haras.centres.map((centre, centreIndex) =>
    createCentre(haras.id, haras.city, centre, harasIndex, centreIndex),
  );

  return {
    ...haras,
    centres,
    stats: {
      centreCount: centres.length,
      activeForms: centres.reduce((sum, centre) => sum + centre.activeMares, 0) + 12,
      pendingReviews: centres.reduce(
        (sum, centre) => sum + centre.pendingReviews,
        0,
      ),
      status: haras.statusLabel,
    },
  };
});

export const allCentres = harasList.flatMap((haras) => haras.centres);

export const getHarasById = (harasId: string) =>
  harasList.find((haras) => haras.id === harasId);

export const getCentreById = (centreId: string) =>
  allCentres.find((centre) => centre.id === centreId);

export const getCentreByName = (harasId: string, centreName: string) =>
  getHarasById(harasId)?.centres.find((centre) => centre.name === centreName);
