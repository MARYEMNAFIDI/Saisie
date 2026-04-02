"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { initialDatabase } from "@/data/mockRecords";
import {
  DatabaseStorageMode,
  MareInput,
  ProductInput,
  ReproductionInput,
} from "@/lib/database-contract";
import {
  DatabaseApiError,
  fetchDatabaseSnapshot,
  upsertDatabaseRecord,
} from "@/lib/database-api";
import {
  removeLocalStorage,
  readLocalStorage,
  writeLocalStorage,
} from "@/lib/storage";
import { useAdminProvider } from "@/components/providers/admin-provider";
import { useSession } from "@/components/providers/session-provider";
import {
  ManagedUser,
  MareRecord,
  ProductRecord,
  ReproductionRecord,
} from "@/types/domain";

const DB_STORAGE_KEY = "equine-prototype-db";
const DB_STORAGE_VERSION_KEY = "equine-prototype-db-version";
const DB_STORAGE_VERSION = 3;

interface MockDatabaseContextValue {
  hydrated: boolean;
  storageMode: DatabaseStorageMode;
  writeEnabled: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  mares: MareRecord[];
  reproductions: ReproductionRecord[];
  products: ProductRecord[];
  upsertMare: (input: MareInput) => Promise<MareRecord>;
  upsertReproduction: (input: ReproductionInput) => Promise<ReproductionRecord>;
  upsertProduct: (input: ProductInput) => Promise<ProductRecord>;
  resetDatabase: () => void;
  getScopedSnapshot: (harasId: string, centreId?: string | null) => {
    mares: MareRecord[];
    reproductions: ReproductionRecord[];
    products: ProductRecord[];
  };
}

const MockDatabaseContext = createContext<MockDatabaseContextValue | null>(null);

const buildId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

type AuditedRecord = {
  harasId: string;
  centreId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

const byUpdatedAt = <T extends { updatedAt: string }>(records: T[]) =>
  [...records].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

const normalizeMareRecord = (record: MareRecord): MareRecord => ({
  ...record,
  transponderNumber: record.transponderNumber ?? "",
  coat: record.coat ?? "",
  stallionPrimary: record.stallionPrimary ?? "",
  stallionSecondary: record.stallionSecondary ?? "",
  breedingAddress: record.breedingAddress ?? "",
  history: record.history ?? "",
  weightKg: record.weightKg ?? "",
  vulvaConformation: record.vulvaConformation ?? "",
});

const normalizeReproductionRecord = (
  record: ReproductionRecord,
): ReproductionRecord => ({
  ...record,
  fertileCycles: record.fertileCycles ?? 0,
  nonFertileCycles: record.nonFertileCycles ?? 0,
  followUpDate: record.followUpDate ?? "",
  bValue: record.bValue ?? "",
  leftOvary: record.leftOvary ?? "",
  rightOvary: record.rightOvary ?? "",
  uterus: record.uterus ?? "",
  fluid: record.fluid ?? "",
  followUpComment: record.followUpComment ?? "",
});

const getScopedUsers = (
  managedUsers: ManagedUser[],
  harasId: string,
  centreId: string,
) =>
  managedUsers.filter((user) => {
    if (user.status !== "active") {
      return false;
    }

    if (!user.harasIds.includes(harasId)) {
      return false;
    }

    return user.centreIds.length === 0 || user.centreIds.includes(centreId);
  });

const getFallbackAudit = (
  managedUsers: ManagedUser[],
  harasId: string,
  centreId: string,
) => {
  const scopedUsers = getScopedUsers(managedUsers, harasId, centreId);
  const creator =
    scopedUsers.find((user) => user.role === "editor") ??
    scopedUsers.find((user) => user.centreIds.includes(centreId)) ??
    scopedUsers[0];
  const updater =
    scopedUsers.find((user) => user.role === "local_admin") ??
    scopedUsers.find((user) => user.role === "exporter") ??
    creator;

  return {
    createdBy: creator?.fullName ?? "Import SOREC",
    updatedBy: updater?.fullName ?? creator?.fullName ?? "Supervision SOREC",
  };
};

const withAudit = <T extends AuditedRecord>(
  record: T,
  managedUsers: ManagedUser[],
): T => {
  const fallbackAudit = getFallbackAudit(
    managedUsers,
    record.harasId,
    record.centreId,
  );

  return {
    ...record,
    createdBy: record.createdBy ?? fallbackAudit.createdBy,
    updatedBy: record.updatedBy ?? fallbackAudit.updatedBy,
  };
};

const normalizeSnapshot = (
  snapshot: {
    mares: MareRecord[];
    reproductions: ReproductionRecord[];
    products: ProductRecord[];
  },
  managedUsers: ManagedUser[],
) => ({
  mares: (snapshot.mares ?? []).map((record) =>
    withAudit(normalizeMareRecord(record), managedUsers),
  ),
  reproductions: (snapshot.reproductions ?? []).map((record) =>
    withAudit(normalizeReproductionRecord(record), managedUsers),
  ),
  products: (snapshot.products ?? []).map((record) =>
    withAudit(record, managedUsers),
  ),
});

const getSeedSnapshot = (managedUsers: ManagedUser[]) =>
  normalizeSnapshot(initialDatabase, managedUsers);

export const MockDatabaseProvider = ({ children }: { children: ReactNode }) => {
  const { directory } = useAdminProvider();
  const { session } = useSession();

  const [mares, setMares] = useState<MareRecord[]>([]);
  const [reproductions, setReproductions] = useState<ReproductionRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageMode, setStorageMode] = useState<DatabaseStorageMode>("local");
  const [writeEnabled, setWriteEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const applySnapshot = (snapshot: {
      mares: MareRecord[];
      reproductions: ReproductionRecord[];
      products: ProductRecord[];
    }) => {
      const normalized = normalizeSnapshot(snapshot, directory.managedUsers);

      setMares(normalized.mares);
      setReproductions(normalized.reproductions);
      setProducts(normalized.products);
    };

    const loadDatabase = async () => {
      const storedVersion = readLocalStorage<number>(DB_STORAGE_VERSION_KEY, 0);

      if (storedVersion !== DB_STORAGE_VERSION) {
        removeLocalStorage(DB_STORAGE_KEY);
        writeLocalStorage(DB_STORAGE_VERSION_KEY, DB_STORAGE_VERSION);
      }

      const cachedSnapshot = readLocalStorage<{
        mares: MareRecord[];
        reproductions: ReproductionRecord[];
        products: ProductRecord[];
      } | null>(DB_STORAGE_KEY, null);
      const fallbackSnapshot = cachedSnapshot ?? getSeedSnapshot(directory.managedUsers);

      try {
        const response = await fetchDatabaseSnapshot();

        if (cancelled) {
          return;
        }

        applySnapshot(response.snapshot);
        setStorageMode("google-sheets");
        setWriteEnabled(true);
        setError(null);
        setLastSyncedAt(response.lastSyncedAt);
        setHydrated(true);
        return;
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        applySnapshot(fallbackSnapshot);

        if (
          loadError instanceof DatabaseApiError &&
          loadError.code === "storage_unconfigured"
        ) {
          setStorageMode("local");
          setWriteEnabled(true);
          setError(null);
          setLastSyncedAt(null);
          setHydrated(true);
          return;
        }

        setStorageMode("google-sheets");
        setWriteEnabled(false);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Le stockage Google Sheets est indisponible.",
        );
        setLastSyncedAt(null);
        setHydrated(true);
      }
    };

    void loadDatabase();

    return () => {
      cancelled = true;
    };
  }, [directory.managedUsers]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeLocalStorage(DB_STORAGE_VERSION_KEY, DB_STORAGE_VERSION);
    writeLocalStorage(DB_STORAGE_KEY, {
      mares,
      reproductions,
      products,
    });
  }, [hydrated, mares, products, reproductions]);

  const actor = session.displayName ?? session.username ?? "admin.sorec";

  const upsertMare = async (input: MareInput) => {
    if (storageMode === "google-sheets") {
      if (!writeEnabled) {
        throw new Error(error ?? "Le stockage Google Sheets est indisponible.");
      }

      const response = await upsertDatabaseRecord({
        entity: "mares",
        record: input,
        actor,
      });
      const savedRecord = withAudit(
        normalizeMareRecord(response.record),
        directory.managedUsers,
      );

      setMares((currentRecords) =>
        byUpdatedAt(
          currentRecords.some((record) => record.id === savedRecord.id)
            ? currentRecords.map((record) =>
                record.id === savedRecord.id ? savedRecord : record,
              )
            : [savedRecord, ...currentRecords],
        ),
      );
      setLastSyncedAt(response.lastSyncedAt);
      setError(null);

      return savedRecord;
    }

    const timestamp = new Date().toISOString();
    const existing = mares.find((record) => record.id === input.id);
    const nextRecord: MareRecord = {
      ...normalizeMareRecord(input as MareRecord),
      id: input.id ?? buildId("mare"),
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      createdBy: existing?.createdBy ?? actor,
      updatedBy: actor,
    };

    setMares((currentRecords) =>
      byUpdatedAt(
        currentRecords.some((record) => record.id === nextRecord.id)
          ? currentRecords.map((record) =>
              record.id === nextRecord.id ? nextRecord : record,
            )
          : [nextRecord, ...currentRecords],
      ),
    );

    return nextRecord;
  };

  const upsertReproduction = async (input: ReproductionInput) => {
    if (storageMode === "google-sheets") {
      if (!writeEnabled) {
        throw new Error(error ?? "Le stockage Google Sheets est indisponible.");
      }

      const response = await upsertDatabaseRecord({
        entity: "reproductions",
        record: input,
        actor,
      });
      const savedRecord = withAudit(
        normalizeReproductionRecord(response.record),
        directory.managedUsers,
      );

      setReproductions((currentRecords) =>
        byUpdatedAt(
          currentRecords.some((record) => record.id === savedRecord.id)
            ? currentRecords.map((record) =>
                record.id === savedRecord.id ? savedRecord : record,
              )
            : [savedRecord, ...currentRecords],
        ),
      );
      setLastSyncedAt(response.lastSyncedAt);
      setError(null);

      return savedRecord;
    }

    const timestamp = new Date().toISOString();
    const existing = reproductions.find((record) => record.id === input.id);
    const nextRecord: ReproductionRecord = {
      ...normalizeReproductionRecord(input as ReproductionRecord),
      id: input.id ?? buildId("repr"),
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      createdBy: existing?.createdBy ?? actor,
      updatedBy: actor,
    };

    setReproductions((currentRecords) =>
      byUpdatedAt(
        currentRecords.some((record) => record.id === nextRecord.id)
          ? currentRecords.map((record) =>
              record.id === nextRecord.id ? nextRecord : record,
            )
          : [nextRecord, ...currentRecords],
      ),
    );

    return nextRecord;
  };

  const upsertProduct = async (input: ProductInput) => {
    if (storageMode === "google-sheets") {
      if (!writeEnabled) {
        throw new Error(error ?? "Le stockage Google Sheets est indisponible.");
      }

      const response = await upsertDatabaseRecord({
        entity: "products",
        record: input,
        actor,
      });
      const savedRecord = withAudit(response.record, directory.managedUsers);

      setProducts((currentRecords) =>
        byUpdatedAt(
          currentRecords.some((record) => record.id === savedRecord.id)
            ? currentRecords.map((record) =>
                record.id === savedRecord.id ? savedRecord : record,
              )
            : [savedRecord, ...currentRecords],
        ),
      );
      setLastSyncedAt(response.lastSyncedAt);
      setError(null);

      return savedRecord;
    }

    const timestamp = new Date().toISOString();
    const existing = products.find((record) => record.id === input.id);
    const nextRecord: ProductRecord = {
      ...input,
      id: input.id ?? buildId("prod"),
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      createdBy: existing?.createdBy ?? actor,
      updatedBy: actor,
    };

    setProducts((currentRecords) =>
      byUpdatedAt(
        currentRecords.some((record) => record.id === nextRecord.id)
          ? currentRecords.map((record) =>
              record.id === nextRecord.id ? nextRecord : record,
            )
          : [nextRecord, ...currentRecords],
      ),
    );

    return nextRecord;
  };

  const resetDatabase = () => {
    if (storageMode !== "local") {
      return;
    }

    const snapshot = getSeedSnapshot(directory.managedUsers);
    setMares(snapshot.mares);
    setReproductions(snapshot.reproductions);
    setProducts(snapshot.products);
    setError(null);
    setLastSyncedAt(null);
  };

  const getScopedSnapshot = (harasId: string, centreId?: string | null) => ({
    mares: mares.filter(
      (record) =>
        record.harasId === harasId &&
        (!centreId || record.centreId === centreId),
    ),
    reproductions: reproductions.filter(
      (record) =>
        record.harasId === harasId &&
        (!centreId || record.centreId === centreId),
    ),
    products: products.filter(
      (record) =>
        record.harasId === harasId &&
        (!centreId || record.centreId === centreId),
    ),
  });

  return (
    <MockDatabaseContext.Provider
      value={{
        hydrated,
        storageMode,
        writeEnabled,
        error,
        lastSyncedAt,
        mares,
        reproductions,
        products,
        upsertMare,
        upsertReproduction,
        upsertProduct,
        resetDatabase,
        getScopedSnapshot,
      }}
    >
      {children}
    </MockDatabaseContext.Provider>
  );
};

export const useMockDatabase = () => {
  const context = useContext(MockDatabaseContext);

  if (!context) {
    throw new Error("useMockDatabase must be used within MockDatabaseProvider");
  }

  return context;
};
