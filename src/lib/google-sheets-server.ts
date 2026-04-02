import "server-only";

import {
  DatabaseEntity,
  DatabaseInputByEntity,
  DatabaseRecordByEntity,
  DatabaseSnapshot,
} from "@/lib/database-contract";

type GoogleScriptEnvelope = {
  ok: boolean;
  message?: string;
  snapshot?: DatabaseSnapshot;
  entity?: DatabaseEntity;
  record?: unknown;
  lastSyncedAt?: string | null;
};

const googleScriptUrl = process.env.GOOGLE_SCRIPT_WEB_APP_URL?.trim();
const googleScriptSecret = process.env.GOOGLE_SCRIPT_SHARED_SECRET?.trim();

export const isGoogleSheetsConfigured = () =>
  Boolean(googleScriptUrl && googleScriptSecret);

const parseGoogleScriptResponse = async (response: Response) => {
  const rawBody = await response.text();

  if (!rawBody) {
    throw new Error("Le script Google n'a renvoye aucun contenu.");
  }

  try {
    return JSON.parse(rawBody) as GoogleScriptEnvelope;
  } catch {
    throw new Error("Le script Google a renvoye une reponse non JSON.");
  }
};

const callGoogleScript = async (payload: Record<string, unknown>) => {
  if (!googleScriptUrl || !googleScriptSecret) {
    throw new Error("La connexion Google Sheets n'est pas configuree.");
  }

  const response = await fetch(googleScriptUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      secret: googleScriptSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Le script Google a repondu avec le statut ${response.status}.`,
    );
  }

  const parsed = await parseGoogleScriptResponse(response);

  if (!parsed.ok) {
    throw new Error(parsed.message ?? "Le script Google a refuse la requete.");
  }

  return parsed;
};

export const fetchGoogleSheetsSnapshot = async () => {
  const response = await callGoogleScript({
    action: "list",
  });

  return {
    snapshot: response.snapshot ?? {
      mares: [],
      reproductions: [],
      products: [],
    },
    lastSyncedAt: response.lastSyncedAt ?? new Date().toISOString(),
  };
};

export const upsertGoogleSheetsRecord = async <E extends DatabaseEntity>(
  entity: E,
  record: DatabaseInputByEntity[E] | Record<string, unknown>,
  actor?: string | null,
) => {
  const response = await callGoogleScript({
    action: "upsert",
    entity,
    record,
    actor: actor ?? null,
  });

  return {
    record: response.record as DatabaseRecordByEntity[E],
    lastSyncedAt: response.lastSyncedAt ?? new Date().toISOString(),
  };
};
