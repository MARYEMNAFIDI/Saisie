import { NextRequest, NextResponse } from "next/server";

import { DatabaseEntity, databaseEntities } from "@/lib/database-contract";
import {
  fetchGoogleSheetsSnapshot,
  isGoogleSheetsConfigured,
  upsertGoogleSheetsRecord,
} from "@/lib/google-sheets-server";

export const dynamic = "force-dynamic";

const isDatabaseEntity = (value: string): value is DatabaseEntity =>
  databaseEntities.includes(value as DatabaseEntity);

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json(
    {
      code,
      message,
    },
    { status },
  );

export async function GET() {
  if (!isGoogleSheetsConfigured()) {
    return jsonError(
      503,
      "storage_unconfigured",
      "Les variables GOOGLE_SCRIPT_WEB_APP_URL et GOOGLE_SCRIPT_SHARED_SECRET sont requises.",
    );
  }

  try {
    const { snapshot, lastSyncedAt } = await fetchGoogleSheetsSnapshot();

    return NextResponse.json({
      ok: true,
      mode: "google-sheets",
      snapshot,
      lastSyncedAt,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de lire les donnees depuis Google Sheets.";

    return jsonError(502, "remote_unavailable", message);
  }
}

export async function POST(request: NextRequest) {
  if (!isGoogleSheetsConfigured()) {
    return jsonError(
      503,
      "storage_unconfigured",
      "Les variables GOOGLE_SCRIPT_WEB_APP_URL et GOOGLE_SCRIPT_SHARED_SECRET sont requises.",
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "invalid_request", "Le corps JSON est invalide.");
  }

  if (!payload || typeof payload !== "object") {
    return jsonError(400, "invalid_request", "Le corps de la requete est manquant.");
  }

  const entity =
    "entity" in payload && typeof payload.entity === "string"
      ? payload.entity
      : null;
  const actor =
    "actor" in payload && typeof payload.actor === "string"
      ? payload.actor
      : null;
  const record =
    "record" in payload && typeof payload.record === "object" && payload.record
      ? payload.record
      : null;

  if (!entity || !isDatabaseEntity(entity)) {
    return jsonError(400, "invalid_request", "L'entite demandee est invalide.");
  }

  if (!record) {
    return jsonError(400, "invalid_request", "Le contenu a enregistrer est invalide.");
  }

  try {
    const { record: savedRecord, lastSyncedAt } = await upsertGoogleSheetsRecord(
      entity,
      record as Record<string, unknown>,
      actor,
    );

    return NextResponse.json({
      ok: true,
      mode: "google-sheets",
      entity,
      record: savedRecord,
      lastSyncedAt,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible d'enregistrer les donnees dans Google Sheets.";

    return jsonError(502, "remote_unavailable", message);
  }
}
