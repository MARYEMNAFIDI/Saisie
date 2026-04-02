import { MareRecord, ProductRecord, ReproductionRecord } from "@/types/domain";

export const databaseEntities = [
  "mares",
  "reproductions",
  "products",
] as const;

export type DatabaseEntity = (typeof databaseEntities)[number];
export type DatabaseStorageMode = "local" | "google-sheets";

export type MareInput = Omit<
  MareRecord,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
> &
  Partial<Pick<MareRecord, "id">>;

export type ReproductionInput = Omit<
  ReproductionRecord,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
> &
  Partial<Pick<ReproductionRecord, "id">>;

export type ProductInput = Omit<
  ProductRecord,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
> &
  Partial<Pick<ProductRecord, "id">>;

export type DatabaseRecordByEntity = {
  mares: MareRecord;
  reproductions: ReproductionRecord;
  products: ProductRecord;
};

export type DatabaseInputByEntity = {
  mares: MareInput;
  reproductions: ReproductionInput;
  products: ProductInput;
};

export type DatabaseSnapshot = {
  mares: MareRecord[];
  reproductions: ReproductionRecord[];
  products: ProductRecord[];
};

export type DatabaseSnapshotResponse = {
  ok: true;
  mode: DatabaseStorageMode;
  snapshot: DatabaseSnapshot;
  lastSyncedAt: string | null;
};

export type DatabaseUpsertRequest =
  | {
      entity: "mares";
      record: MareInput;
      actor?: string | null;
    }
  | {
      entity: "reproductions";
      record: ReproductionInput;
      actor?: string | null;
    }
  | {
      entity: "products";
      record: ProductInput;
      actor?: string | null;
    };

export type DatabaseUpsertResponse<E extends DatabaseEntity = DatabaseEntity> = {
  ok: true;
  mode: DatabaseStorageMode;
  entity: E;
  record: DatabaseRecordByEntity[E];
  lastSyncedAt: string | null;
};
