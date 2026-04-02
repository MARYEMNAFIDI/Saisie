import {
  DatabaseEntity,
  DatabaseInputByEntity,
  DatabaseSnapshotResponse,
  DatabaseUpsertResponse,
} from "@/lib/database-contract";

type ApiErrorPayload = {
  code?: string;
  message?: string;
};

export class DatabaseApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, status: number, code = "unknown_error") {
    super(message);
    this.name = "DatabaseApiError";
    this.code = code;
    this.status = status;
  }
}

const parseError = async (response: Response) => {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return {
      code: payload.code ?? "unknown_error",
      message: payload.message ?? "La base distante n'a pas repondu correctement.",
    };
  } catch {
    return {
      code: "unknown_error",
      message: "La base distante n'a pas repondu correctement.",
    };
  }
};

export const fetchDatabaseSnapshot = async () => {
  const response = await fetch("/api/database", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await parseError(response);
    throw new DatabaseApiError(error.message, response.status, error.code);
  }

  return (await response.json()) as DatabaseSnapshotResponse;
};

export const upsertDatabaseRecord = async <E extends DatabaseEntity>(params: {
  entity: E;
  record: DatabaseInputByEntity[E];
  actor?: string | null;
}) => {
  const response = await fetch("/api/database", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await parseError(response);
    throw new DatabaseApiError(error.message, response.status, error.code);
  }

  return (await response.json()) as DatabaseUpsertResponse<E>;
};
