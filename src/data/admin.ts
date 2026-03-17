import { harasList } from "@/data/haras";
import {
  AdminDirectoryState,
  AdminSession,
  HarasCredential,
} from "@/types/domain";

export const ADMIN_DIRECTORY_STORAGE_KEY = "equine-prototype-admin-directory";
export const ADMIN_SESSION_STORAGE_KEY = "equine-prototype-admin-session";

const now = "2026-03-13T09:00:00.000Z";
const defaultGlobalAccessCode = "00000000";

const buildCredential = (harasId: string, code: string): HarasCredential => ({
  harasId,
  code,
  updatedAt: now,
  updatedBy: "maryem.nafidi",
});

export const defaultAdminDirectory: AdminDirectoryState = {
  adminAccounts: [
    {
      id: "admin-root",
      fullName: "Administrateur initial",
      username: "admin",
      email: "admin@local",
      password: "ChangeMe2026!",
      level: "super_admin",
      createdAt: now,
      updatedAt: now,
      lastPasswordUpdate: now,
    },
    {
      id: "admin-maryem-nafidi",
      fullName: "Maryem Nafidi",
      username: "maryem.nafidi",
      email: "maryem.nafidi@local",
      password: "00000000",
      level: "super_admin",
      createdAt: now,
      updatedAt: now,
      lastPasswordUpdate: now,
    },
  ],
  managedUsers: [
    {
      id: "managed-maryem-nafidi",
      fullName: "Maryem Nafidi",
      username: "maryem.nafidi",
      email: "maryem.nafidi@local",
      password: "00000000",
      phone: "",
      role: "local_admin",
      status: "active",
      harasIds: harasList.map((haras) => haras.id),
      centreIds: [],
      notes: "Accès global à l'admin, aux haras et aux CRE.",
      createdAt: now,
      updatedAt: now,
      lastPasswordUpdate: now,
    },
  ],
  harasCredentials: harasList.map((haras) =>
    buildCredential(haras.id, defaultGlobalAccessCode),
  ),
};

export const defaultAdminSession: AdminSession = {
  status: "locked",
  adminId: null,
  username: null,
  fullName: null,
  lastAuthenticatedAt: null,
};
