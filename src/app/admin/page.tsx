"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Database,
  Download,
  FileSpreadsheet,
  KeyRound,
  LockKeyhole,
  LogOut,
  RefreshCw,
  Save,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { allCentres, getHarasById, harasList } from "@/data/haras";
import { roleConfigs } from "@/data/roles";
import { downloadTextFile } from "@/lib/storage";
import { formatDateTime } from "@/lib/utils";
import { MareRecord, ProductRecord, ReproductionRecord } from "@/types/domain";
import { useAdminProvider } from "@/components/providers/admin-provider";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { SorecLogo } from "@/components/branding/sorec-logo";
import { PageHeader } from "@/components/page-header";
import { RoleBadge } from "@/components/role-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type UserDraft = {
  id?: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  role: (typeof roleConfigs)[number]["id"];
  status: "active" | "suspended";
  harasId: string;
  centreId: string;
  notes: string;
  createdAt?: string;
  lastPasswordUpdate?: string;
};

const ALL_HARAS = "all";

const createUserDraft = (): UserDraft => ({
  fullName: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  role: "viewer",
  status: "active",
  harasId: harasList[0].id,
  centreId: "all",
  notes: "",
});

const buildPassword = (seed: string) =>
  `${seed.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5)}-${new Date().getFullYear()}!`;

const toCsv = (rows: Array<Record<string, string | number | boolean>>) => {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const escapeValue = (value: string | number | boolean) =>
    `"${String(value).replace(/"/g, '""')}"`;

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeValue(row[header])).join(",")),
  ].join("\n");
};

type ExportSelection = {
  harasIds: string[];
  centreIds: string[];
};

type AdminExportType =
  | "base_metier"
  | "haras"
  | "cre"
  | "juments"
  | "reproduction"
  | "production"
  | "utilisateurs";

type XlsxRow = Record<string, string | number | boolean>;
type XlsxSheet = {
  sheetName: string;
  rows: XlsxRow[];
};

const adminExportOptions: Array<{
  id: AdminExportType;
  label: string;
  description: string;
  recommended?: boolean;
}> = [
  {
    id: "base_metier",
    label: "Base metier prioritaire",
    description: "Reproduction + Production + Fertilite dans un seul fichier XLSX.",
    recommended: true,
  },
  { id: "reproduction", label: "Reproduction", description: "Cycles, diagnostic, incidents." },
  { id: "production", label: "Production", description: "Naissance, statut, declaration." },
  { id: "juments", label: "Juments", description: "Fiches juments essentielles." },
  { id: "cre", label: "CRE", description: "Centres de reproduction equine." },
  { id: "haras", label: "Haras", description: "Referentiel haras." },
  { id: "utilisateurs", label: "Utilisateurs", description: "Comptes metier et roles." },
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const computeRatio = (numerator: number, denominator: number) =>
  denominator > 0 ? (numerator / denominator) * 100 : 0;

const formatPercent = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value);

const getAgeFromBirthDate = (birthDate: string) => {
  if (!birthDate) {
    return "";
  }

  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const hasNotHadBirthday =
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());

  if (hasNotHadBirthday) {
    age -= 1;
  }

  return age >= 0 ? age : "";
};

const getIncidentSummary = (record: ReproductionRecord) => {
  const incidents: string[] = [];
  if (record.heatReturn) incidents.push("Retour chaleur");
  if (record.abortion) incidents.push("Avortement");
  if (record.embryoResorption) incidents.push("Resorption embryonnaire");
  if (record.nonOvulation) incidents.push("Non-ovulation");
  if (record.uterineInfection) incidents.push("Infection uterine");
  if (record.twinPregnancy) incidents.push("Gestation gemellaire");
  if (record.traumaticAccident) incidents.push("Accident traumatique");
  return incidents.join(" | ");
};

const buildFertilityRows = (
  mares: MareRecord[],
  reproductions: ReproductionRecord[],
  products: ProductRecord[],
): XlsxRow[] => {
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

  const conception = computeRatio(confirmedGestations, reproductions.length);
  const production = computeRatio(products.length, reproductions.length);
  const global = computeRatio(maresWithProduction, mares.length);

  return [
    {
      Indice: "Conception",
      Formule: "(Gestations confirmees / Suivis reproduction) x 100",
      Numerateur: confirmedGestations,
      Denominateur: reproductions.length,
      "Valeur %": formatPercent(conception),
    },
    {
      Indice: "Production",
      Formule: "(Productions / Suivis reproduction) x 100",
      Numerateur: products.length,
      Denominateur: reproductions.length,
      "Valeur %": formatPercent(production),
    },
    {
      Indice: "Fertilite globale",
      Formule: "(Juments productives / Juments suivies) x 100",
      Numerateur: maresWithProduction,
      Denominateur: mares.length,
      "Valeur %": formatPercent(global),
    },
  ];
};

const findCentre = (centreId: string) =>
  allCentres.find((centre) => centre.id === centreId);

const getHarasLabel = (harasId: string) =>
  getHarasById(harasId)?.shortName ?? harasId;

const getCentreLabel = (centreId: string) => findCentre(centreId)?.name ?? centreId;

const matchesExportSelection = <
  T extends {
    harasId: string;
    centreId: string;
  },
>(
  record: T,
  selection: ExportSelection,
) => {
  const matchesHaras =
    selection.harasIds.length === 0 || selection.harasIds.includes(record.harasId);
  const matchesCentre =
    selection.centreIds.length === 0 || selection.centreIds.includes(record.centreId);

  return matchesHaras && matchesCentre;
};

const escapeHtml = (value: string | number | boolean) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const buildExcelTable = (
  title: string,
  rows: Array<Record<string, string | number | boolean>>,
) => {
  if (rows.length === 0) {
    return `<section><h2>${escapeHtml(title)}</h2><p>Aucune ligne à exporter.</p></section>`;
  }

  const headers = Object.keys(rows[0]);

  return `
    <section>
      <h2>${escapeHtml(title)}</h2>
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) =>
                `<tr>${headers
                  .map((header) => `<td>${escapeHtml(row[header])}</td>`)
                  .join("")}</tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
};

const buildExcelHtml = ({
  title,
  harasLabel,
  centreLabel,
  mares,
  reproductions,
  products,
}: {
  title: string;
  harasLabel: string;
  centreLabel: string;
  mares: MareRecord[];
  reproductions: ReproductionRecord[];
  products: ProductRecord[];
}) => {
  const mareRows = mares.map((record) => ({
    Type: "Jument",
    Nom: record.name,
    FARAS: record.farasNumber,
    Haras: getHarasLabel(record.harasId),
    Centre: getCentreLabel(record.centreId),
    Saison: record.season,
    Proprietaire: record.owner,
    CreePar: record.createdBy ?? "N/A",
    CreeLe: formatDateTime(record.createdAt),
    ModifiePar: record.updatedBy ?? "N/A",
    ModifieLe: formatDateTime(record.updatedAt),
  }));

  const reproductionRows = reproductions.map((record) => ({
    Type: "Reproduction",
    Jument: mares.find((mare) => mare.id === record.mareId)?.name ?? record.mareId,
    Etalon: record.stallion,
    Haras: getHarasLabel(record.harasId),
    Centre: getCentreLabel(record.centreId),
    Diagnostic: record.diagnosis,
    Cycles: record.totalCycles,
    CreePar: record.createdBy ?? "N/A",
    CreeLe: formatDateTime(record.createdAt),
    ModifiePar: record.updatedBy ?? "N/A",
    ModifieLe: formatDateTime(record.updatedAt),
  }));

  const productRows = products.map((record) => ({
    Type: "Produit",
    Jument: mares.find((mare) => mare.id === record.mareId)?.name ?? record.mareId,
    SIREMA: record.siremaProduct,
    Haras: getHarasLabel(record.harasId),
    Centre: getCentreLabel(record.centreId),
    Statut: record.productStatus,
    Naissance: record.birthDate,
    CreePar: record.createdBy ?? "N/A",
    CreeLe: formatDateTime(record.createdAt),
    ModifiePar: record.updatedBy ?? "N/A",
    ModifieLe: formatDateTime(record.updatedAt),
  }));

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
        h1 { margin-bottom: 8px; }
        .meta { margin-bottom: 18px; color: #475569; }
        section { margin-top: 28px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background: #e2e8f0; font-weight: 700; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <p class="meta">Haras: ${escapeHtml(harasLabel)} | Centres / CRE: ${escapeHtml(
        centreLabel,
      )} | Généré le: ${escapeHtml(formatDateTime(new Date().toISOString()))}</p>
      ${buildExcelTable("Juments", mareRows)}
      ${buildExcelTable("Reproduction", reproductionRows)}
      ${buildExcelTable("Produits", productRows)}
    </body>
  </html>`;
};

export default function AdminPage() {
  const {
    hydrated,
    session,
    directory,
    login,
    logout,
    updateHarasCredential,
    upsertManagedUser,
    updateManagedUserPassword,
    updateManagedUserStatus,
    deleteManagedUser,
    updateAdminAccountPassword,
    resetDirectory,
  } = useAdminProvider();
  const { mares, reproductions, products } = useMockDatabase();

  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [userDraft, setUserDraft] = useState<UserDraft>(createUserDraft());
  const [databaseFilter, setDatabaseFilter] = useState({
    harasId: "all",
    centreId: "all",
    search: "",
  });
  const [codeDrafts, setCodeDrafts] = useState<Record<string, string>>({});
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [exportType, setExportType] = useState<AdminExportType>("base_metier");
  const [excelSelection, setExcelSelection] = useState<ExportSelection>({
    harasIds: [],
    centreIds: [],
  });

  const totalRecords = mares.length + reproductions.length + products.length;
  const activeUsers = directory.managedUsers.filter((user) => user.status === "active");
  const allHarasIds = harasList.map((haras) => haras.id);
  const selectedHarasCentres = allCentres.filter(
    (centre) =>
      userDraft.harasId === ALL_HARAS || centre.harasId === userDraft.harasId,
  );

  const filteredMares = mares.filter((record) => {
    const matchesHaras =
      databaseFilter.harasId === "all" || record.harasId === databaseFilter.harasId;
    const matchesCentre =
      databaseFilter.centreId === "all" || record.centreId === databaseFilter.centreId;
    const matchesSearch =
      !databaseFilter.search ||
      [record.name, record.farasNumber, record.owner]
        .join(" ")
        .toLowerCase()
        .includes(databaseFilter.search.toLowerCase());

    return matchesHaras && matchesCentre && matchesSearch;
  });

  const filteredMareIds = new Set(filteredMares.map((record) => record.id));
  const filteredReproductions = reproductions.filter((record) =>
    filteredMareIds.has(record.mareId),
  );
  const filteredProducts = products.filter((record) =>
    filteredMareIds.has(record.mareId),
  );

  const scopedExportCentres = allCentres.filter((centre) =>
    excelSelection.harasIds.length === 0
      ? true
      : excelSelection.harasIds.includes(centre.harasId),
  );
  const exportMares = mares.filter((record) =>
    matchesExportSelection(record, excelSelection),
  );
  const exportMareIds = new Set(exportMares.map((record) => record.id));
  const exportReproductions = reproductions.filter(
    (record) =>
      matchesExportSelection(record, excelSelection) &&
      exportMareIds.has(record.mareId),
  );
  const exportProducts = products.filter(
    (record) =>
      matchesExportSelection(record, excelSelection) &&
      exportMareIds.has(record.mareId),
  );
  const exportHarasLabel =
    excelSelection.harasIds.length === 0
      ? "Tous les haras"
      : excelSelection.harasIds.map(getHarasLabel).join(", ");
  const exportCentreLabel =
    excelSelection.centreIds.length === 0
      ? "Tous les centres / CRE"
      : excelSelection.centreIds.map(getCentreLabel).join(", ");
  const mareById = Object.fromEntries(mares.map((mare) => [mare.id, mare]));

  const structuredPayload = useMemo(
    () => ({
      generatedAt: new Date().toISOString(),
      adminSession: session,
      directory,
      database: {
        mares,
        reproductions,
        products,
      },
    }),
    [directory, mares, products, reproductions, session],
  );

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await login(credentials.username, credentials.password);

    if (!result.success) {
      toast.error("Connexion admin refusée", { description: result.message });
      return;
    }

    toast.success("Portail admin ouvert", { description: result.message });
  };

  const handleSaveUser = () => {
    if (!userDraft.fullName || !userDraft.username || !userDraft.password) {
      toast.error("Formulaire incomplet", {
        description: "Nom, identifiant et mot de passe sont obligatoires.",
      });
      return;
    }

    const selectedHarasIds =
      userDraft.harasId === ALL_HARAS ? allHarasIds : [userDraft.harasId];

    const savedUser = upsertManagedUser({
      id: userDraft.id,
      fullName: userDraft.fullName,
      username: userDraft.username,
      email: userDraft.email,
      password: userDraft.password,
      phone: userDraft.phone,
      role: userDraft.role,
      status: userDraft.status,
      harasIds: selectedHarasIds,
      centreIds: userDraft.centreId === "all" ? [] : [userDraft.centreId],
      notes: userDraft.notes,
      createdAt: userDraft.createdAt,
      lastPasswordUpdate: userDraft.lastPasswordUpdate,
    });

    const hasAllHaras = savedUser.harasIds.length === allHarasIds.length;

    setUserDraft({
      id: savedUser.id,
      fullName: savedUser.fullName,
      username: savedUser.username,
      email: savedUser.email,
      password: savedUser.password,
      phone: savedUser.phone,
      role: savedUser.role,
      status: savedUser.status,
      harasId: hasAllHaras ? ALL_HARAS : savedUser.harasIds[0] ?? harasList[0].id,
      centreId: savedUser.centreIds[0] ?? "all",
      notes: savedUser.notes,
      createdAt: savedUser.createdAt,
      lastPasswordUpdate: savedUser.lastPasswordUpdate,
    });

    toast.success("Utilisateur enregistré", {
      description: `${savedUser.fullName} est maintenant disponible dans le portail.`,
    });
  };

  const handleExport = (filename: string, content: string, mimeType?: string) => {
    downloadTextFile(filename, content, mimeType);
    toast.success("Export généré", { description: `${filename} a été téléchargé.` });
  };

  const toggleExcelHaras = (harasId: string) => {
    setExcelSelection((currentValue) => {
      const nextHarasIds = currentValue.harasIds.includes(harasId)
        ? currentValue.harasIds.filter((value) => value !== harasId)
        : [...currentValue.harasIds, harasId];

      return {
        harasIds: nextHarasIds,
        centreIds: currentValue.centreIds.filter((centreId) => {
          const centre = findCentre(centreId);
          return centre
            ? nextHarasIds.length === 0 || nextHarasIds.includes(centre.harasId)
            : false;
        }),
      };
    });
  };

  const toggleExcelCentre = (centreId: string) => {
    setExcelSelection((currentValue) => ({
      ...currentValue,
      centreIds: currentValue.centreIds.includes(centreId)
        ? currentValue.centreIds.filter((value) => value !== centreId)
        : [...currentValue.centreIds, centreId],
    }));
  };

  const resetExcelSelection = () => {
    setExcelSelection({ harasIds: [], centreIds: [] });
  };

  const downloadXlsxWorkbook = (filename: string, sheets: XlsxSheet[]) => {
    const workbook = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
      const worksheet = XLSX.utils.json_to_sheet(
        sheet.rows.length > 0 ? sheet.rows : [{ message: "Aucune donnee a exporter." }],
      );
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
    });

    const arrayBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const reproductionBaseRows: XlsxRow[] = exportReproductions.map((record, index) => {
    const mare = mareById[record.mareId];
    return {
      "N° SAILLIE": index + 1,
      Jument: mare?.name ?? record.mareId,
      "N° Esirema": record.previousProductSirema || "N/A",
      Race: mare?.breed ?? "",
      AGE: getAgeFromBirthDate(mare?.birthDate ?? ""),
      "Etalon N-1": record.stallion,
      "Resultat diagnostic": record.diagnosis,
      "1er Cycle": record.firstCycleDate,
      "2eme Cycle": record.secondCycleDate,
      "3eme cycle": record.thirdCycleDate,
      "4eme cycle": record.fourthCycleDate,
      "Resultat cycle": record.cycleResult,
      Proprietaire: mare?.owner ?? "",
      Haras: getHarasLabel(record.harasId),
      CRE: getCentreLabel(record.centreId),
      Incidents: getIncidentSummary(record),
    };
  });

  const productionBaseRows: XlsxRow[] = exportProducts.map((record) => {
    const mare = mareById[record.mareId];
    return {
      Jument: mare?.name ?? record.mareId,
      "N° Esirema": record.siremaProduct,
      Race: record.breed || mare?.breed || "",
      AGE: getAgeFromBirthDate(mare?.birthDate ?? ""),
      "Date naissance": record.birthDate,
      Sexe: record.sex,
      "Statut production": record.productStatus,
      Declaration: record.declaration,
      Identification: record.identification,
      Proprietaire: mare?.owner ?? "",
      Haras: getHarasLabel(record.harasId),
      CRE: getCentreLabel(record.centreId),
    };
  });

  const buildExportWorkbook = () => {
    switch (exportType) {
      case "base_metier":
        return {
          filename: "sorec-base-metier-prioritaire.xlsx",
          sheets: [
            { sheetName: "Base_infos", rows: reproductionBaseRows },
            { sheetName: "Production", rows: productionBaseRows },
            {
              sheetName: "Indices_fertilite",
              rows: buildFertilityRows(exportMares, exportReproductions, exportProducts),
            },
          ],
        };
      case "haras":
        return {
          filename: "sorec-haras.xlsx",
          sheets: [
            {
              sheetName: "Haras",
              rows: harasList
                .filter((haras) =>
                  excelSelection.harasIds.length === 0
                    ? true
                    : excelSelection.harasIds.includes(haras.id),
                )
                .map((haras) => ({
                  haras: haras.name,
                  ville: haras.city,
                  statut: haras.statusLabel,
                  cre_total: haras.centres.length,
                  code_acces:
                    directory.harasCredentials.find(
                      (credential) => credential.harasId === haras.id,
                    )?.code ?? "",
                })),
            },
          ],
        };
      case "cre":
        return {
          filename: "sorec-cre.xlsx",
          sheets: [
            {
              sheetName: "CRE",
              rows: scopedExportCentres
                .filter((centre) =>
                  excelSelection.centreIds.length === 0
                    ? true
                    : excelSelection.centreIds.includes(centre.id),
                )
                .map((centre) => ({
                  cre: centre.name,
                  haras: getHarasLabel(centre.harasId),
                  type: centre.type,
                  region: centre.region,
                  manager: centre.manager,
                  statut_sync: centre.status,
                })),
            },
          ],
        };
      case "reproduction":
        return {
          filename: "sorec-reproduction-base.xlsx",
          sheets: [{ sheetName: "Reproduction", rows: reproductionBaseRows }],
        };
      case "production":
        return {
          filename: "sorec-production-base.xlsx",
          sheets: [{ sheetName: "Production", rows: productionBaseRows }],
        };
      case "utilisateurs":
        return {
          filename: "sorec-utilisateurs.xlsx",
          sheets: [
            {
              sheetName: "Utilisateurs",
              rows: directory.managedUsers.map((user) => ({
                nom: user.fullName,
                login: user.username,
                role: user.role,
                statut: user.status,
                haras: user.harasIds.map(getHarasLabel).join(" | "),
                cre: user.centreIds.map(getCentreLabel).join(" | "),
              })),
            },
          ],
        };
      case "juments":
      default:
        return {
          filename: "sorec-juments.xlsx",
          sheets: [
            {
              sheetName: "Juments",
              rows: exportMares.map((record) => ({
                nom: record.name,
                faras: record.farasNumber,
                haras: getHarasLabel(record.harasId),
                cre: getCentreLabel(record.centreId),
                saison: record.season,
                proprietaire: record.owner,
                admission: record.admissionStatus,
              })),
            },
          ],
        };
    }
  };

  const exportPreviewText = (() => {
    switch (exportType) {
      case "base_metier":
        return `${reproductionBaseRows.length} lignes reproduction, ${productionBaseRows.length} lignes production, 3 indices fertilite.`;
      case "reproduction":
        return `${reproductionBaseRows.length} lignes reproduction base.`;
      case "production":
        return `${productionBaseRows.length} lignes production base.`;
      case "juments":
        return `${exportMares.length} lignes juments.`;
      case "cre":
        return `${scopedExportCentres.length} CRE disponibles.`;
      case "haras":
        return `${harasList.length} haras referentiels.`;
      case "utilisateurs":
        return `${directory.managedUsers.length} utilisateurs.`;
      default:
        return "";
    }
  })();
  const selectedExportOption =
    adminExportOptions.find((option) => option.id === exportType) ??
    adminExportOptions[0];

  const handleExcelExport = () => {
    const { filename, sheets } = buildExportWorkbook();
    downloadXlsxWorkbook(filename, sheets);
    toast.success("Export XLSX genere", {
      description: `${filename} a ete telecharge.`,
    });
    setIsExcelModalOpen(false);
  };

  if (!hydrated) {
    return (
      <main className="container space-y-6 py-8 lg:py-10">
        <Skeleton className="h-28 w-full rounded-[2rem]" />
        <Skeleton className="h-[720px] w-full rounded-[2rem]" />
      </main>
    );
  }

  if (session.status !== "authenticated") {
    return (
      <main className="relative isolate overflow-hidden py-8 lg:py-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.08),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#fff7ed_100%)]" />
        <div className="absolute left-[-6rem] top-20 -z-10 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-40 -z-10 h-72 w-72 rounded-full bg-slate-900/10 blur-3xl" />

        <div className="container grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <Card className="relative overflow-hidden border-slate-900/10 bg-slate-950 shadow-[0_32px_100px_rgba(15,23,42,0.22)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),linear-gradient(140deg,rgba(15,23,42,0.86),rgba(30,41,59,0.92)_58%,rgba(217,119,6,0.84))]" />
            <div className="absolute inset-y-10 right-[-3rem] w-40 rounded-full border border-white/10 bg-white/5 blur-2xl" />

            <CardContent className="relative flex h-full flex-col justify-between p-8 text-white lg:p-10">
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <SorecLogo tone="light" size="lg" />
                  <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
                    Dashboard admin
                  </div>
                </div>

                <div className="space-y-5">
                  <p className="section-caption text-white/65">Pilotage central</p>
                  <h1 className="max-w-3xl text-5xl font-semibold leading-[0.92] text-white lg:text-6xl">
                    Un portail admin plus net, plus direct.
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-white/78 lg:text-base">
                    Ouvrez la session admin, gérez les comptes, réglez les codes
                    haras et surveillez la base locale depuis une seule entrée.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      icon: LockKeyhole,
                      title: "Connexion rapide",
                      text: "Entrez un compte admin valide puis ouvrez le portail central.",
                    },
                    {
                      icon: KeyRound,
                      title: "Paramètres haras",
                      text: "Configurez les accès et paramètres des haras sans changer d'écran.",
                    },
                    {
                      icon: Database,
                      title: "Base locale",
                      text: "Gardez une vue directe sur les comptes, exports et données.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl border border-white/15 bg-white/10 p-2.5">
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-white/72">
                          {item.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Comptes admin",
                    value: directory.adminAccounts.length,
                    hint: "Portail central",
                  },
                  {
                    label: "Profils actifs",
                    value: activeUsers.length,
                    hint: "Haras et CRE",
                  },
                  {
                    label: "Haras suivis",
                    value: harasList.length,
                    hint: "Codes a piloter",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.35rem] border border-white/15 bg-black/15 px-4 py-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-white/65">{item.hint}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-white/80 bg-white/92 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
              <CardHeader className="space-y-5 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="section-caption">Connexion admin</p>
                    <CardTitle className="text-4xl leading-none text-slate-950">
                      Ouvrir le portail
                    </CardTitle>
                    <CardDescription className="max-w-md text-sm leading-6">
                      Entrez un compte admin valide pour acceder au pilotage global
                      des acces, des codes et de la base locale.
                    </CardDescription>
                  </div>
                  <div className="rounded-[1.4rem] bg-slate-950 p-3 text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)]">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      step: "01",
                      title: "Compte",
                      text: "Saisir votre identifiant admin.",
                    },
                    {
                      step: "02",
                      title: "Verification",
                      text: "Ajouter le mot de passe du compte.",
                    },
                    {
                      step: "03",
                      title: "Ouverture",
                      text: "Entrer dans le dashboard admin.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="rounded-[1.35rem] border border-slate-200 bg-slate-50/90 p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                        {item.step}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <form className="space-y-5" onSubmit={handleAdminLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Identifiant</Label>
                    <Input
                      id="admin-username"
                      value={credentials.username}
                      placeholder="ex: maryem.nafidi"
                      autoComplete="username"
                      onChange={(event) =>
                        setCredentials((currentValue) => ({
                          ...currentValue,
                          username: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Mot de passe</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={credentials.password}
                      placeholder="Saisir le mot de passe"
                      autoComplete="current-password"
                      onChange={(event) =>
                        setCredentials((currentValue) => ({
                          ...currentValue,
                          password: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="rounded-[1.35rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
                    <p className="font-semibold">Point de depart</p>
                    <p className="mt-2 leading-6 text-amber-900/80">
                      Une fois connecte, vous pourrez creer les profils, regler les
                      codes haras et lancer les exports admin.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="submit"
                      className="h-12 flex-1 bg-slate-950 text-white hover:bg-slate-900"
                    >
                      <LockKeyhole className="h-4 w-4" />
                      Ouvrir le dashboard admin
                    </Button>
                    <Button asChild variant="outline" className="h-12 flex-1">
                      <Link href="/">Retour accueil</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-white/80 bg-white/78">
              <CardContent className="grid gap-4 p-6 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/90 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-950 p-2.5 text-white">
                      <UserCog className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-slate-950">
                      Apres connexion
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Le premier ecran donne acces aux comptes admin, aux profils
                    metier, aux codes haras et a la base locale.
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/90 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-amber-500 p-2.5 text-slate-950">
                      <Users className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-slate-950">
                      Parcours plus simple
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Cette entree va droit au but: connexion, controle, puis
                    administration globale sans surcharge.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container space-y-6 py-8 lg:py-10">
      <PageHeader
        eyebrow="Portail admin"
        title="Administration des acces et des donnees"
        description="Pilotage central des comptes admin, utilisateurs metier, acces par haras et exports structures de la base mockee."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/">Retour a l'accueil</Link>
            </Button>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Deconnexion
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-5"><p className="section-caption">Admins</p><p className="mt-3 text-3xl font-semibold text-slate-950">{directory.adminAccounts.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="section-caption">Utilisateurs actifs</p><p className="mt-3 text-3xl font-semibold text-slate-950">{activeUsers.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="section-caption">Codes haras</p><p className="mt-3 text-3xl font-semibold text-slate-950">{directory.harasCredentials.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="section-caption">Enregistrements</p><p className="mt-3 text-3xl font-semibold text-slate-950">{totalRecords}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Vue globale</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="security">Securite</TabsTrigger>
          <TabsTrigger value="database">Base de donnees</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Etat du portail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-slate-950">Session admin:</span>{" "}
                  {session.fullName}
                </p>
                <p>
                  <span className="font-semibold text-slate-950">Derniere connexion:</span>{" "}
                  {formatDateTime(session.lastAuthenticatedAt)}
                </p>
                <p>
                  <span className="font-semibold text-slate-950">Perimetres utilisateurs:</span>{" "}
                  {new Set(directory.managedUsers.flatMap((user) => user.harasIds)).size} haras actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setExportType("base_metier");
                    setIsExcelModalOpen(true);
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export base metier (XLSX)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setExportType("utilisateurs");
                    setIsExcelModalOpen(true);
                  }}
                >
                  <Users className="h-4 w-4" />
                  Export utilisateurs (XLSX)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setExportType("haras");
                    setIsExcelModalOpen(true);
                  }}
                >
                  <KeyRound className="h-4 w-4" />
                  Export haras (XLSX)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetDirectory();
                    toast.message("Portail admin reinitialise", {
                      description:
                        "Les comptes, codes et utilisateurs sont revenus a l'etat initial.",
                    });
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reinitialiser l'admin
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Fiche utilisateur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Nom complet</Label>
                    <Input
                      value={userDraft.fullName}
                      onChange={(event) =>
                        setUserDraft((currentValue) => ({
                          ...currentValue,
                          fullName: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Identifiant</Label>
                    <Input
                      value={userDraft.username}
                      onChange={(event) =>
                        setUserDraft((currentValue) => ({
                          ...currentValue,
                          username: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={userDraft.email}
                      onChange={(event) =>
                        setUserDraft((currentValue) => ({
                          ...currentValue,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telephone</Label>
                    <Input
                      value={userDraft.phone}
                      onChange={(event) =>
                        setUserDraft((currentValue) => ({
                          ...currentValue,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mot de passe</Label>
                    <Input
                      value={userDraft.password}
                      onChange={(event) =>
                        setUserDraft((currentValue) => ({
                          ...currentValue,
                          password: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={userDraft.role}
                        onValueChange={(value) =>
                          setUserDraft((currentValue) => ({
                            ...currentValue,
                            role: value as UserDraft["role"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleConfigs.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Statut</Label>
                      <Select
                        value={userDraft.status}
                        onValueChange={(value) =>
                          setUserDraft((currentValue) => ({
                            ...currentValue,
                            status: value as UserDraft["status"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="suspended">Suspendu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Haras</Label>
                    <Select
                      value={userDraft.harasId}
                      onValueChange={(value) =>
                        setUserDraft((currentValue) => ({
                          ...currentValue,
                          harasId: value,
                          centreId: "all",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_HARAS}>Tous les haras</SelectItem>
                        {harasList.map((haras) => (
                          <SelectItem key={haras.id} value={haras.id}>
                            {haras.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Centre autorise</Label>
                    <Select
                      value={userDraft.centreId}
                      onValueChange={(value) =>
                        setUserDraft((currentValue) => ({
                          ...currentValue,
                          centreId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tout le haras</SelectItem>
                        {selectedHarasCentres.map((centre) => (
                          <SelectItem key={centre.id} value={centre.id}>
                            {userDraft.harasId === ALL_HARAS
                              ? `${getHarasById(centre.harasId)?.shortName ?? centre.harasId} - ${centre.name}`
                              : centre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={userDraft.notes}
                      onChange={(event) =>
                        setUserDraft((currentValue) => ({
                          ...currentValue,
                          notes: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleSaveUser}>
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </Button>
                  <Button variant="outline" onClick={() => setUserDraft(createUserDraft())}>
                    Nouveau profil
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs metier</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Haras</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Mot de passe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {directory.managedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <button
                            type="button"
                            className="text-left"
                            onClick={() =>
                              setUserDraft({
                                id: user.id,
                                fullName: user.fullName,
                                username: user.username,
                                email: user.email,
                                password: user.password,
                                phone: user.phone,
                                role: user.role,
                                status: user.status,
                                harasId:
                                  user.harasIds.length === allHarasIds.length
                                    ? ALL_HARAS
                                    : user.harasIds[0] ?? harasList[0].id,
                                centreId: user.centreIds[0] ?? "all",
                                notes: user.notes,
                                createdAt: user.createdAt,
                                lastPasswordUpdate: user.lastPasswordUpdate,
                              })
                            }
                          >
                            <p className="font-semibold text-slate-950">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.username}</p>
                          </button>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          {user.harasIds
                            .map((harasId) => getHarasById(harasId)?.shortName ?? harasId)
                            .join(", ")}
                        </TableCell>
                        <TableCell>{user.status}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const password = buildPassword(user.username);
                                updateManagedUserPassword(user.id, password);
                                toast.success("Mot de passe regenere", {
                                  description: `${user.username}: ${password}`,
                                });
                                if (userDraft.id === user.id) {
                                  setUserDraft((currentValue) => ({
                                    ...currentValue,
                                    password,
                                    lastPasswordUpdate: new Date().toISOString(),
                                  }));
                                }
                              }}
                            >
                              <KeyRound className="h-4 w-4" />
                              Reset
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateManagedUserStatus(
                                  user.id,
                                  user.status === "active" ? "suspended" : "active",
                                )
                              }
                            >
                              {user.status === "active" ? "Suspendre" : "Activer"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (!window.confirm(`Supprimer ${user.fullName} ?`)) {
                                  return;
                                }

                                deleteManagedUser(user.id);
                                toast.success("Utilisateur supprime", {
                                  description: `${user.fullName} a ete retire du portail.`,
                                });

                                if (userDraft.id === user.id) {
                                  setUserDraft(createUserDraft());
                                }
                              }}
                            >
                              <X className="h-4 w-4" />
                              Supprimer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres d'accès des haras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {directory.harasCredentials.map((credential) => (
                  <div
                    key={credential.harasId}
                    className="rounded-[1.25rem] border border-border bg-muted/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {getHarasById(credential.harasId)?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Maj: {formatDateTime(credential.updatedAt)}
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap gap-3 md:w-auto">
                        <Input
                          className="md:w-[180px]"
                          value={codeDrafts[credential.harasId] ?? credential.code}
                          onChange={(event) =>
                            setCodeDrafts((currentValue) => ({
                              ...currentValue,
                              [credential.harasId]: event.target.value.toUpperCase(),
                            }))
                          }
                        />
                        <Button
                          onClick={() => {
                            updateHarasCredential(
                              credential.harasId,
                              (codeDrafts[credential.harasId] ?? credential.code).toUpperCase(),
                              session.username ?? "admin",
                            );
                            toast.success("Code mis a jour", {
                              description: `Les paramètres du haras ${getHarasById(credential.harasId)?.shortName} ont été modifiés.`,
                            });
                          }}
                        >
                          <Save className="h-4 w-4" />
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comptes admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {directory.adminAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-[1.25rem] border border-border bg-muted/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{account.fullName}</p>
                        <p className="text-xs text-muted-foreground">{account.username}</p>
                      </div>
                      <div className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {account.level}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const password = buildPassword(account.username);
                          updateAdminAccountPassword(account.id, password);
                          toast.success("Mot de passe admin regenere", {
                            description: `${account.username}: ${password}`,
                          });
                        }}
                      >
                        <KeyRound className="h-4 w-4" />
                        Regenerer le mot de passe
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        Derniere rotation: {formatDateTime(account.lastPasswordUpdate)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtrer la base mockee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Visualisez la base mockee avec sa piste d'audit: creation,
                    derniere modification, auteur et perimetre de saisie.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border bg-white/70 px-3 py-1">
                      {filteredMares.length} juments
                    </span>
                    <span className="rounded-full border border-border bg-white/70 px-3 py-1">
                      {filteredReproductions.length} suivis
                    </span>
                    <span className="rounded-full border border-border bg-white/70 px-3 py-1">
                      {filteredProducts.length} produits
                    </span>
                  </div>
                </div>
                <Button
                  variant="accent"
                  onClick={() => setIsExcelModalOpen(true)}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Exporter XLSX
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_220px_260px]">
                <Input
                  placeholder="Rechercher une jument, un FARAS ou un proprietaire"
                  value={databaseFilter.search}
                  onChange={(event) =>
                    setDatabaseFilter((currentValue) => ({
                      ...currentValue,
                      search: event.target.value,
                    }))
                  }
                />
                <Select
                  value={databaseFilter.harasId}
                  onValueChange={(value) =>
                    setDatabaseFilter({
                      harasId: value,
                      centreId: "all",
                      search: databaseFilter.search,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les haras</SelectItem>
                    {harasList.map((haras) => (
                      <SelectItem key={haras.id} value={haras.id}>
                        {haras.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={databaseFilter.centreId}
                  onValueChange={(value) =>
                    setDatabaseFilter((currentValue) => ({
                      ...currentValue,
                      centreId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les centres</SelectItem>
                    {allCentres
                      .filter((centre) =>
                        databaseFilter.harasId === "all"
                          ? true
                          : centre.harasId === databaseFilter.harasId,
                      )
                      .map((centre) => (
                        <SelectItem key={centre.id} value={centre.id}>
                          {centre.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="mares">
            <TabsList>
              <TabsTrigger value="mares">Juments</TabsTrigger>
              <TabsTrigger value="reproductions">Reproduction</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
            </TabsList>
            <TabsContent value="mares">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>FARAS</TableHead>
                        <TableHead>Haras</TableHead>
                        <TableHead>Centre</TableHead>
                        <TableHead>Cree par</TableHead>
                        <TableHead>Modifie par</TableHead>
                        <TableHead>Derniere maj</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMares.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>{record.farasNumber}</TableCell>
                          <TableCell>{getHarasById(record.harasId)?.shortName}</TableCell>
                          <TableCell>
                            {findCentre(record.centreId)?.region}
                          </TableCell>
                          <TableCell>{record.createdBy ?? "N/A"}</TableCell>
                          <TableCell>{record.updatedBy ?? "N/A"}</TableCell>
                          <TableCell>{formatDateTime(record.updatedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reproductions">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mare</TableHead>
                        <TableHead>Etalon</TableHead>
                        <TableHead>Diagnostic</TableHead>
                        <TableHead>Cycles</TableHead>
                        <TableHead>Cree par</TableHead>
                        <TableHead>Modifie par</TableHead>
                        <TableHead>Derniere maj</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReproductions.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{mares.find((mare) => mare.id === record.mareId)?.name}</TableCell>
                          <TableCell>{record.stallion}</TableCell>
                          <TableCell>{record.diagnosis}</TableCell>
                          <TableCell>{record.totalCycles}</TableCell>
                          <TableCell>{record.createdBy ?? "N/A"}</TableCell>
                          <TableCell>{record.updatedBy ?? "N/A"}</TableCell>
                          <TableCell>{formatDateTime(record.updatedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="products">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mare</TableHead>
                        <TableHead>SIREMA</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Naissance</TableHead>
                        <TableHead>Cree par</TableHead>
                        <TableHead>Modifie par</TableHead>
                        <TableHead>Derniere maj</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{mares.find((mare) => mare.id === record.mareId)?.name}</TableCell>
                          <TableCell>{record.siremaProduct}</TableCell>
                          <TableCell>{record.productStatus}</TableCell>
                          <TableCell>{record.birthDate}</TableCell>
                          <TableCell>{record.createdBy ?? "N/A"}</TableCell>
                          <TableCell>{record.updatedBy ?? "N/A"}</TableCell>
                          <TableCell>{formatDateTime(record.updatedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="exports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export XLSX</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tous les exports admin se font au format XLSX. Le profil recommande
                est Base metier prioritaire: reproduction, production et indices de
                fertilite avec champs essentiels.
              </p>
              <Button onClick={() => setIsExcelModalOpen(true)}>
                <FileSpreadsheet className="h-4 w-4" />
                Ouvrir la selection d export
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isExcelModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 sm:p-6">
          <div className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center">
          <Card className="flex max-h-[92vh] w-full flex-col overflow-hidden">
            <CardHeader className="shrink-0 border-b border-border">
              <CardTitle>Selection de l export XLSX</CardTitle>
              <CardDescription>
                Choisissez le type de donnees a exporter puis validez le telechargement.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Profil d export</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {adminExportOptions.map((option) => {
                      const selected = exportType === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setExportType(option.id)}
                          className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                            selected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card/60 hover:bg-muted/40"
                          }`}
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {option.label}
                            {option.recommended ? (
                              <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-foreground">
                                Prioritaire
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/25 p-4">
                  <p className="section-caption">Resume</p>
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {selectedExportOption.label}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{exportPreviewText}</p>
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground">Haras:</span>{" "}
                      {exportHarasLabel}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">CRE:</span>{" "}
                      {exportCentreLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">Perimetre export</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setExcelSelection({ harasIds: [], centreIds: [] })}
                    >
                      Tous les haras
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExcelSelection({
                          harasIds: harasList.map((haras) => haras.id),
                          centreIds: [],
                        })
                      }
                    >
                      Tout cocher
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Haras</Label>
                    <div className="flex max-h-36 flex-wrap gap-2 overflow-auto rounded-2xl border border-border p-3">
                      {harasList.map((haras) => {
                        const selected = excelSelection.harasIds.includes(haras.id);
                        return (
                          <Button
                            key={haras.id}
                            type="button"
                            size="sm"
                            variant={selected ? "default" : "outline"}
                            onClick={() => toggleExcelHaras(haras.id)}
                          >
                            {haras.shortName}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>CRE</Label>
                    <div className="flex max-h-36 flex-wrap gap-2 overflow-auto rounded-2xl border border-border p-3">
                      {scopedExportCentres.map((centre) => {
                        const selected = excelSelection.centreIds.includes(centre.id);
                        return (
                          <Button
                            key={centre.id}
                            type="button"
                            size="sm"
                            variant={selected ? "default" : "outline"}
                            onClick={() => toggleExcelCentre(centre.id)}
                          >
                            {centre.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-border bg-card/95 p-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetExcelSelection();
                  setIsExcelModalOpen(false);
                }}
              >
                Annuler
              </Button>
              <Button variant="ghost" onClick={resetExcelSelection}>
                Reinitialiser les filtres
              </Button>
              <Button onClick={handleExcelExport}>
                <Download className="h-4 w-4" />
                Telecharger XLSX
              </Button>
            </div>
          </Card>
          </div>
        </div>
      ) : null}
    </main>
  );
}
