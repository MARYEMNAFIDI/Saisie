"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { initialDatabase } from "@/data/mockRecords";
import { useAdminProvider } from "@/components/providers/admin-provider";
import { useSession } from "@/components/providers/session-provider";
import {
  removeLocalStorage,
  readLocalStorage,
  writeLocalStorage,
} from "@/lib/storage";
import {
  ManagedUser,
  MareRecord,
  ProductRecord,
  ReproductionRecord,
} from "@/types/domain";

const DB_STORAGE_KEY = "equine-prototype-db";
const DB_STORAGE_VERSION_KEY = "equine-prototype-db-version";
const DB_STORAGE_VERSION = 2;

type MareInput = Omit<
  MareRecord,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
> &
  Partial<Pick<MareRecord, "id">>;
type ReproductionInput = Omit<
  ReproductionRecord,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
> &
  Partial<Pick<ReproductionRecord, "id">>;
type ProductInput = Omit<
  ProductRecord,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
> &
  Partial<Pick<ProductRecord, "id">>;

interface MockDatabaseContextValue {
  hydrated: boolean;
  mares: MareRecord[];
  reproductions: ReproductionRecord[];
  products: ProductRecord[];
  upsertMare: (input: MareInput) => MareRecord;
  upsertReproduction: (input: ReproductionInput) => ReproductionRecord;
  upsertProduct: (input: ProductInput) => ProductRecord;
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

export const MockDatabaseProvider = ({ children }: { children: ReactNode }) => {
  const { directory } = useAdminProvider();
  const { session } = useSession();
  const [mares, setMares] = useState<MareRecord[]>(() =>
    initialDatabase.mares.map((record) =>
      withAudit(normalizeMareRecord(record), directory.managedUsers),
    ),
  );
  const [reproductions, setReproductions] = useState<ReproductionRecord[]>(
    () =>
      initialDatabase.reproductions.map((record) =>
        withAudit(normalizeReproductionRecord(record), directory.managedUsers),
      ),
  );
  const [products, setProducts] = useState<ProductRecord[]>(() =>
    initialDatabase.products.map((record) => withAudit(record, directory.managedUsers)),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedVersion = readLocalStorage<number>(DB_STORAGE_VERSION_KEY, 0);

    if (storedVersion !== DB_STORAGE_VERSION) {
      removeLocalStorage(DB_STORAGE_KEY);
      setMares(
        initialDatabase.mares.map((record) =>
          withAudit(normalizeMareRecord(record), directory.managedUsers),
        ),
      );
      setReproductions(
        initialDatabase.reproductions.map((record) =>
          withAudit(normalizeReproductionRecord(record), directory.managedUsers),
        ),
      );
      setProducts(
        initialDatabase.products.map((record) => withAudit(record, directory.managedUsers)),
      );
      writeLocalStorage(DB_STORAGE_VERSION_KEY, DB_STORAGE_VERSION);
      setHydrated(true);
      return;
    }

    const stored = readLocalStorage<{
      mares: MareRecord[];
      reproductions: ReproductionRecord[];
      products: ProductRecord[];
    } | null>(DB_STORAGE_KEY, null);

    if (stored) {
      setMares(
        (stored.mares ?? initialDatabase.mares).map((record) =>
          withAudit(normalizeMareRecord(record), directory.managedUsers),
        ),
      );
      setReproductions(
        (stored.reproductions ?? initialDatabase.reproductions).map((record) =>
          withAudit(normalizeReproductionRecord(record), directory.managedUsers),
        ),
      );
      setProducts(
        (stored.products ?? initialDatabase.products).map((record) =>
          withAudit(record, directory.managedUsers),
        ),
      );
    }

    setHydrated(true);
  }, [directory.managedUsers]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeLocalStorage(DB_STORAGE_KEY, {
      mares,
      reproductions,
      products,
    });
  }, [hydrated, mares, products, reproductions]);

  const upsertMare = (input: MareInput) => {
    const timestamp = new Date().toISOString();
    const existing = mares.find((record) => record.id === input.id);
    const actor =
      session.displayName ?? session.username ?? "admin.sorec";
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

  const upsertReproduction = (input: ReproductionInput) => {
    const timestamp = new Date().toISOString();
    const existing = reproductions.find((record) => record.id === input.id);
    const actor =
      session.displayName ?? session.username ?? "admin.sorec";
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

  const upsertProduct = (input: ProductInput) => {
    const timestamp = new Date().toISOString();
    const existing = products.find((record) => record.id === input.id);
    const actor =
      session.displayName ?? session.username ?? "admin.sorec";
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
    setMares(
      initialDatabase.mares.map((record) =>
        withAudit(normalizeMareRecord(record), directory.managedUsers),
      ),
    );
    setReproductions(
      initialDatabase.reproductions.map((record) =>
        withAudit(normalizeReproductionRecord(record), directory.managedUsers),
      ),
    );
    setProducts(
      initialDatabase.products.map((record) =>
        withAudit(record, directory.managedUsers),
      ),
    );
    removeLocalStorage(DB_STORAGE_KEY);
    writeLocalStorage(DB_STORAGE_VERSION_KEY, DB_STORAGE_VERSION);
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
