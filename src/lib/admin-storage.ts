import {
  ADMIN_DIRECTORY_STORAGE_KEY,
  ADMIN_SESSION_STORAGE_KEY,
  defaultAdminDirectory,
  defaultAdminSession,
} from "@/data/admin";
import {
  AdminDirectoryState,
  AdminSession,
  HarasCredential,
  ManagedUser,
} from "@/types/domain";
import { readLocalStorage } from "@/lib/storage";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const mergeByKey = <T,>(
  currentItems: T[],
  bootstrapItems: T[],
  getKey: (item: T) => string,
) => {
  const itemMap = new Map(currentItems.map((item) => [getKey(item), item]));

  bootstrapItems.forEach((item) => {
    if (!itemMap.has(getKey(item))) {
      itemMap.set(getKey(item), clone(item));
    }
  });

  return Array.from(itemMap.values());
};

const mergeHarasCredentials = (credentials: HarasCredential[]) => {
  const credentialMap = new Map(
    credentials.map((credential) => [credential.harasId, credential]),
  );

  defaultAdminDirectory.harasCredentials.forEach((bootstrapCredential) => {
    const existingCredential = credentialMap.get(bootstrapCredential.harasId);

    if (!existingCredential) {
      credentialMap.set(bootstrapCredential.harasId, clone(bootstrapCredential));
      return;
    }

    if (existingCredential.code.trim().length > 0) {
      return;
    }

    credentialMap.set(bootstrapCredential.harasId, {
      ...existingCredential,
      code: bootstrapCredential.code,
      updatedAt: bootstrapCredential.updatedAt,
      updatedBy: bootstrapCredential.updatedBy,
    });
  });

  return Array.from(credentialMap.values());
};

export const reconcileAdminDirectory = (
  directory: AdminDirectoryState,
): AdminDirectoryState => ({
  ...directory,
  adminAccounts: mergeByKey(
    directory.adminAccounts,
    defaultAdminDirectory.adminAccounts,
    (account) => account.username,
  ),
  managedUsers: mergeByKey(
    directory.managedUsers,
    defaultAdminDirectory.managedUsers,
    (user) => user.username,
  ),
  harasCredentials: mergeHarasCredentials(directory.harasCredentials),
});

export const getDefaultAdminDirectory = () => clone(defaultAdminDirectory);

export const getAdminDirectorySnapshot = () =>
  reconcileAdminDirectory(
    readLocalStorage<AdminDirectoryState>(
      ADMIN_DIRECTORY_STORAGE_KEY,
      getDefaultAdminDirectory(),
    ),
  );

export const getAdminSessionSnapshot = () =>
  readLocalStorage<AdminSession>(ADMIN_SESSION_STORAGE_KEY, defaultAdminSession);

export const getConfiguredHarasCode = (harasId: string) =>
  getAdminDirectorySnapshot().harasCredentials.find(
    (credential) => credential.harasId === harasId,
  )?.code;

export const getManagedUserById = (userId: string) =>
  getAdminDirectorySnapshot().managedUsers.find((user) => user.id === userId);

export const getAuthorizedUsersForScope = ({
  harasId,
  centreId,
}: {
  harasId: string;
  centreId?: string;
}) =>
  getAdminDirectorySnapshot().managedUsers.filter((user) => {
    if (user.status !== "active") {
      return false;
    }

    if (!user.harasIds.includes(harasId)) {
      return false;
    }

    if (!centreId) {
      return true;
    }

    return user.centreIds.length === 0 || user.centreIds.includes(centreId);
  });

export const getUserScopeLabel = (user: ManagedUser) =>
  user.centreIds.length > 0 ? "Centre cible" : "Portee haras";
