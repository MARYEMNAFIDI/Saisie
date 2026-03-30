"use client";

import { Download, ExternalLink } from "lucide-react";

import { formatShortDate, slugify } from "@/lib/utils";
import { Centre } from "@/types/domain";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type MareDigitalSheetValues = {
  name: string;
  farasNumber: string;
  transponderNumber: string;
  breed: string;
  birthDate: string;
  owner: string;
  phone: string;
  breedingAddress: string;
  history: string;
  weightKg: string;
  bcs: string;
  physiologicalStatus: string;
  coat: string;
  stallionPrimary: string;
  stallionSecondary: string;
  vulvaConformation: string;
  admissionStatus: string;
  refusalReason: string;
  centreId: string;
  season: string;
};

export type MareDigitalSheetFollowUpRow = {
  date: string;
  b: string;
  og: string;
  od: string;
  matrice: string;
  liquide: string;
  commentaire: string;
};

type PdfLineField = {
  x: number;
  bottom: number;
  maxWidth: number;
  fontSize: number;
  value: string;
};

type PdfBlockField = {
  x: number;
  top: number;
  maxWidth: number;
  fontSize: number;
  lineHeight: number;
  value: string;
};

const TEMPLATE_PDF_URL = "/templates/fiche-individuelle-suivi-jument.pdf";
const TEMPLATE_PREVIEW_URL = "/templates/fiche-individuelle-suivi-jument.pdf#view=FitH";

const PDF_VALUE_COLOR = [28 / 255, 37 / 255, 65 / 255] as const;

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

  return age >= 0 ? `${age}` : "";
};

const formatValue = (value: string) =>
  value && value.trim().length > 0 ? value : "Non renseigne";

const formatPdfValue = (value: string) => value.trim();

const fitPdfLineText = ({
  text,
  font,
  fontSize,
  maxWidth,
}: {
  text: string;
  font: {
    widthOfTextAtSize: (text: string, size: number) => number;
  };
  fontSize: number;
  maxWidth: number;
}) => {
  const normalizedText = text.trim();
  if (!normalizedText) {
    return "";
  }

  if (font.widthOfTextAtSize(normalizedText, fontSize) <= maxWidth) {
    return normalizedText;
  }

  let shortenedText = normalizedText;
  while (shortenedText.length > 1) {
    const candidate = `${shortenedText.slice(0, -1)}…`;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      return candidate;
    }
    shortenedText = shortenedText.slice(0, -1);
  }

  return normalizedText.slice(0, 1);
};

const wrapPdfText = ({
  text,
  font,
  fontSize,
  maxWidth,
}: {
  text: string;
  font: {
    widthOfTextAtSize: (text: string, size: number) => number;
  };
  fontSize: number;
  maxWidth: number;
}) => {
  const paragraphs = text
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter((paragraph, index, items) => paragraph.length > 0 || items.length === 1);

  const lines: string[] = [];

  paragraphs.forEach((paragraph) => {
    if (!paragraph) {
      lines.push("");
      return;
    }

    let currentLine = "";

    paragraph.split(/\s+/).forEach((word) => {
      const nextLine = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(nextLine, fontSize) <= maxWidth) {
        currentLine = nextLine;
        return;
      }

      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    });

    if (currentLine) {
      lines.push(currentLine);
    }
  });

  return lines.length > 0 ? lines : [""];
};

const triggerPdfDownload = (filename: string, pdfBytes: Uint8Array) => {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedBytes = new Uint8Array(Array.from(pdfBytes));
  const blob = new Blob([normalizedBytes.buffer], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

const drawPdfLineField = ({
  page,
  pageHeight,
  font,
  color,
  field,
}: {
  page: any;
  pageHeight: number;
  font: any;
  color: any;
  field: PdfLineField;
}) => {
  if (!field.value) {
    return;
  }

  page.drawText(field.value, {
    x: field.x,
    y: pageHeight - field.bottom + 3,
    size: field.fontSize,
    font,
    color,
    maxWidth: field.maxWidth,
  });
};

const drawPdfBlockField = ({
  page,
  pageHeight,
  font,
  color,
  field,
}: {
  page: any;
  pageHeight: number;
  font: any;
  color: any;
  field: PdfBlockField;
}) => {
  if (!field.value) {
    return;
  }

  const lines = wrapPdfText({
    text: field.value,
    font,
    fontSize: field.fontSize,
    maxWidth: field.maxWidth,
  });

  lines.forEach((line, index) => {
    page.drawText(line, {
      x: field.x,
      y: pageHeight - field.top - field.fontSize - index * field.lineHeight,
      size: field.fontSize,
      font,
      color,
    });
  });
};

export const downloadMareDigitalSheet = async ({
  form,
  centres,
  followUpRows = [],
}: {
  form: MareDigitalSheetValues;
  centres: Centre[];
  harasLabel: string;
  followUpRows?: MareDigitalSheetFollowUpRow[];
}) => {
  const [{ PDFDocument, StandardFonts, rgb }, response] = await Promise.all([
    import("pdf-lib"),
    fetch(TEMPLATE_PDF_URL),
  ]);

  if (!response.ok) {
    throw new Error("Impossible de charger le modèle PDF de la jument.");
  }

  const templatePdfBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templatePdfBytes);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const [page, followUpPage] = pdfDoc.getPages();
  const { height: pageHeight } = page.getSize();
  const color = rgb(...PDF_VALUE_COLOR);

  const lineFields: PdfLineField[] = [
    {
      x: 344,
      bottom: 147.40377807617188,
      maxWidth: 160,
      fontSize: 11,
      value: formatPdfValue(form.season),
    },
    {
      x: 84,
      bottom: 268.5329895019531,
      maxWidth: 120,
      fontSize: 10.3,
      value: formatPdfValue(form.name),
    },
    {
      x: 80,
      bottom: 304.5465393066406,
      maxWidth: 80,
      fontSize: 10.3,
      value: getAgeFromBirthDate(form.birthDate),
    },
    {
      x: 98,
      bottom: 352.56463623046875,
      maxWidth: 110,
      fontSize: 10.3,
      value: formatPdfValue(form.farasNumber),
    },
    {
      x: 96,
      bottom: 400.5827331542969,
      maxWidth: 110,
      fontSize: 10.3,
      value: formatPdfValue(form.transponderNumber),
    },
    {
      x: 76,
      bottom: 448.600830078125,
      maxWidth: 130,
      fontSize: 10.3,
      value: formatPdfValue(form.breed),
    },
    {
      x: 88,
      bottom: 494.9053649902344,
      maxWidth: 120,
      fontSize: 10.3,
      value: formatPdfValue(form.physiologicalStatus),
    },
    {
      x: 94,
      bottom: 541.435302734375,
      maxWidth: 110,
      fontSize: 10.3,
      value: formatPdfValue(form.stallionPrimary),
    },
    {
      x: 95,
      bottom: 584.8568115234375,
      maxWidth: 110,
      fontSize: 10.3,
      value: formatPdfValue(form.stallionSecondary),
    },
    {
      x: 325,
      bottom: 264.3632507324219,
      maxWidth: 205,
      fontSize: 10.3,
      value: formatPdfValue(form.owner),
    },
    {
      x: 298,
      bottom: 315.3824768066406,
      maxWidth: 175,
      fontSize: 10.3,
      value: formatPdfValue(form.phone),
    },
    {
      x: 272,
      bottom: 417.4209289550781,
      maxWidth: 120,
      fontSize: 10.3,
      value: formatPdfValue(form.weightKg),
    },
    {
      x: 292,
      bottom: 475.9429626464844,
      maxWidth: 120,
      fontSize: 10.3,
      value: formatPdfValue(form.bcs),
    },
  ];

  const blockFields: PdfBlockField[] = [
    {
      x: 350,
      top: 349,
      maxWidth: 160,
      fontSize: 9.5,
      lineHeight: 11.5,
      value: formatPdfValue(form.breedingAddress),
    },
    {
      x: 375,
      top: 510,
      maxWidth: 150,
      fontSize: 9.4,
      lineHeight: 11.5,
      value: formatPdfValue(form.vulvaConformation),
    },
    {
      x: 44,
      top: 676,
      maxWidth: 505,
      fontSize: 10,
      lineHeight: 12,
      value: formatPdfValue(form.history),
    },
  ];

  page.drawText("DONNEES DE SUIVI", {
    x: 412,
    y: pageHeight - 239,
    size: 9,
    font: boldFont,
    color,
  });

  lineFields.forEach((field) =>
    drawPdfLineField({
      page,
      pageHeight,
      font: regularFont,
      color,
      field,
    }),
  );

  blockFields.forEach((field) =>
    drawPdfBlockField({
      page,
      pageHeight,
      font: regularFont,
      color,
      field,
    }),
  );

  if (followUpPage && followUpRows.length > 0) {
    const { height: followUpPageHeight } = followUpPage.getSize();
    const firstRow = followUpRows[0];
    const tableCells = [
      { x: 49.7535, top: 104.7477, width: 49.0012, height: 19.953, value: firstRow.date },
      { x: 124.0075, top: 104.7477, width: 12.2506, height: 19.953, value: firstRow.b },
      { x: 175.8708, top: 104.7477, width: 12.2506, height: 19.953, value: firstRow.og },
      { x: 231.5717, top: 104.7477, width: 12.2506, height: 19.953, value: firstRow.od },
      { x: 294.4785, top: 104.7477, width: 50.3088, height: 19.953, value: firstRow.matrice },
      { x: 373.6175, top: 104.7477, width: 46.4051, height: 19.953, value: firstRow.liquide },
      { x: 445.238, top: 104.7477, width: 85.7518, height: 19.953, value: firstRow.commentaire },
    ];

    tableCells.forEach((cell) => {
      const text = fitPdfLineText({
        text: formatPdfValue(cell.value),
        font: regularFont,
        fontSize: 8.2,
        maxWidth: cell.width - 4,
      });

      if (!text) {
        return;
      }

      followUpPage.drawRectangle({
        x: cell.x - 0.8,
        y: followUpPageHeight - (cell.top + cell.height) + 2.2,
        width: cell.width + 1.6,
        height: cell.height - 4.4,
        color: rgb(1, 1, 1),
      });

      followUpPage.drawText(text, {
        x: cell.x + 1.5,
        y: followUpPageHeight - (cell.top + cell.height) + 8,
        size: 8.2,
        font: regularFont,
        color,
        maxWidth: cell.width - 4,
      });
    });
  }

  const pdfBytes = await pdfDoc.save();
  const filename = `fiche-jument-${slugify(form.name || form.farasNumber || "saisie")}.pdf`;
  triggerPdfDownload(filename, pdfBytes);
};

export const MareDigitalSheet = ({
  form,
  centres,
  harasLabel,
  followUpRows = [],
}: {
  form: MareDigitalSheetValues;
  centres: Centre[];
  harasLabel: string;
  followUpRows?: MareDigitalSheetFollowUpRow[];
}) => {
  const centreLabel =
    centres.find((centre) => centre.id === form.centreId)?.name ?? "Non selectionne";

  const downloadSheet = () => {
    void downloadMareDigitalSheet({ form, centres, harasLabel, followUpRows });
  };

  const identityFields = [
    { label: "Nom", value: formatValue(form.name) },
    { label: "SIRE/MA", value: formatValue(form.farasNumber) },
    { label: "N Transpondeur", value: formatValue(form.transponderNumber) },
    { label: "Race", value: formatValue(form.breed) },
    { label: "Date naissance", value: formatShortDate(form.birthDate) },
    { label: "Age", value: getAgeFromBirthDate(form.birthDate) || "Non renseigne" },
    { label: "Statut", value: formatValue(form.physiologicalStatus) },
    { label: "Etalon I", value: formatValue(form.stallionPrimary) },
    { label: "Etalon II", value: formatValue(form.stallionSecondary) },
  ];

  const ownerFields = [
    { label: "Nom et prenom", value: formatValue(form.owner) },
    { label: "Telephone", value: formatValue(form.phone) },
    { label: "Adresse elevage", value: formatValue(form.breedingAddress) },
  ];

  const followUpFields = [
    { label: "Poids (Kg)", value: formatValue(form.weightKg) },
    { label: "Note BCS", value: formatValue(form.bcs) },
    { label: "Conformation vulve", value: formatValue(form.vulvaConformation) },
    { label: "Historique", value: formatValue(form.history) },
  ];

  const previewFollowUpRow = followUpRows[0];

  return (
    <div className="rounded-[1.75rem] border border-border bg-white/80 p-5 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-caption">Fiche numerique</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            Fiche individuelle de suivi de la jument
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Le telechargement utilise maintenant le PDF exact fourni comme base visuelle,
            puis place les donnees par-dessus aux emplacements de la maquette.
          </p>
        </div>
        <Button variant="outline" onClick={downloadSheet}>
          <Download className="h-4 w-4" />
          Telecharger fiche de suivie jument
        </Button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-border/70 bg-slate-50/80">
          <CardContent className="space-y-6 p-0">
            <div className="border-b border-border/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.95)_0%,rgba(238,242,255,0.92)_48%,rgba(254,243,199,0.9)_100%)] px-6 py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Fiche individuelle de suivi de la jument
              </p>
              <h4 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {formatValue(form.name)}
              </h4>
              <p className="mt-3 text-sm text-slate-600">
                {harasLabel} · {centreLabel} · Saison {formatValue(form.season)}
              </p>
            </div>

            <div className="space-y-6 px-6 pb-6">
              <section className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Jument
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {identityFields.map((field) => (
                    <div
                      key={field.label}
                      className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {field.label}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{field.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Proprietaire
                </p>
                <div className="grid gap-3">
                  {ownerFields.map((field) => (
                    <div
                      key={field.label}
                      className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {field.label}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{field.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Suivi / Informations
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {followUpFields.map((field) => (
                    <div
                      key={field.label}
                      className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {field.label}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-900">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {previewFollowUpRow ? (
                <section className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Tableau page 2
                  </p>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: "Date", value: previewFollowUpRow.date },
                      { label: "B", value: previewFollowUpRow.b },
                      { label: "OG", value: previewFollowUpRow.og },
                      { label: "OD", value: previewFollowUpRow.od },
                      { label: "Matrice", value: previewFollowUpRow.matrice },
                      { label: "Liquide", value: previewFollowUpRow.liquide },
                      { label: "Commentaire", value: previewFollowUpRow.commentaire },
                    ].map((field) => (
                      <div
                        key={field.label}
                        className={`rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 ${
                          field.label === "Commentaire" ? "md:col-span-2 xl:col-span-2" : ""
                        }`}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {field.label}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-900">
                          {formatValue(field.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-border bg-slate-50/70 p-4">
            <p className="section-caption">Modele PDF exact</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              L’aperçu ci-dessous utilise le meme PDF source que celui qui sert de base
              au telechargement rempli.
            </p>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: 0,
              paddingTop: "141.4286%",
              boxShadow: "0 2px 8px 0 rgba(63,69,81,0.16)",
              overflow: "hidden",
              borderRadius: "24px",
              willChange: "transform",
            }}
          >
            <iframe
              loading="lazy"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
                border: "none",
                padding: 0,
                margin: 0,
              }}
              src={TEMPLATE_PREVIEW_URL}
              allowFullScreen
              allow="fullscreen"
            />
          </div>

          <a
            href={TEMPLATE_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-950"
          >
            Ouvrir le PDF modele
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
