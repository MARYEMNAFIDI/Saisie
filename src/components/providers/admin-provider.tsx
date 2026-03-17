"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ADMIN_DIRECTORY_STORAGE_KEY,
  ADMIN_SESSION_STORAGE_KEY,
  defaultAdminSession,
} from "@/data/admin";
import {
  getDefaultAdminDirectory,
  reconcileAdminDirectory,
} from "@/lib/admin-storage";
import { wait } from "@/lib/utils";
import {
  removeLocalStorage,
  readLocalStorage,
  writeLocalStorage,
} from "@/lib/storage";
import {
  AdminDirectoryState,
  AdminSession,
  ManagedUser,
} from "@/types/domain";

type ManagedUserInput = Omit<
  ManagedUser,
  "id" | "createdAt" | "updatedAt" | "lastPasswordUpdate"
> &
  Partial<Pick<ManagedUser, "id" | "createdAt" | "lastPasswordUpdate">>;

interface AdminProviderValue {
  hydrated: boolean;
  session: AdminSession;
  directory: AdminDirectoryState;
  login: (username: string, password: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  logout: () => void;
  updateHarasCredential: (harasId: string, code: string, updatedBy: string) => void;
  upsertManagedUser: (input: ManagedUserInput) => ManagedUser;
  updateManagedUserPassword: (userId: string, password: string) => void;
  updateManagedUserStatus: (userId: string, status: ManagedUser["status"]) => void;
  deleteManagedUser: (userId: string) => void;
  updateAdminAccountPassword: (adminId: string, password: string) => void;
  resetDirectory: () => void;
  getUsersForScope: (harasId: string, centreId?: string) => ManagedUser[];
}

const AdminContext = createContext<AdminProviderValue | null>(null);

const buildId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const ADMIN_STORAGE_VERSION_KEY = "equine-prototype-admin-version";
const ADMIN_STORAGE_VERSION = 2;

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<AdminSession>(defaultAdminSession);
  const [directory, setDirectory] = useState<AdminDirectoryState>(getDefaultAdminDirectory);

  useEffect(() => {
    const storedVersion = readLocalStorage<number>(ADMIN_STORAGE_VERSION_KEY, 0);

    if (storedVersion !== ADMIN_STORAGE_VERSION) {
      removeLocalStorage(ADMIN_DIRECTORY_STORAGE_KEY);
      removeLocalStorage(ADMIN_SESSION_STORAGE_KEY);
      writeLocalStorage(ADMIN_STORAGE_VERSION_KEY, ADMIN_STORAGE_VERSION);
      setDirectory(getDefaultAdminDirectory());
      setSession(defaultAdminSession);
      setHydrated(true);
      return;
    }

    const storedDirectory = reconcileAdminDirectory(
      readLocalStorage<AdminDirectoryState>(
        ADMIN_DIRECTORY_STORAGE_KEY,
        getDefaultAdminDirectory(),
      ),
    );
    const storedSession = readLocalStorage<AdminSession>(
      ADMIN_SESSION_STORAGE_KEY,
      defaultAdminSession,
    );

    setDirectory(storedDirectory);
    setSession(storedSession);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeLocalStorage(ADMIN_DIRECTORY_STORAGE_KEY, directory);
  }, [directory, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (session.status === "authenticated") {
      writeLocalStorage(ADMIN_SESSION_STORAGE_KEY, session);
      return;
    }

    removeLocalStorage(ADMIN_SESSION_STORAGE_KEY);
  }, [hydrated, session]);

  const login: AdminProviderValue["login"] = async (username, password) => {
    await wait(700);

    const account = directory.adminAccounts.find(
      (item) => item.username === username && item.password === password,
    );

    if (!account) {
      return {
        success: false,
        message: "Identifiants admin invalides.",
      };
    }

    setSession({
      status: "authenticated",
      adminId: account.id,
      username: account.username,
      fullName: account.fullName,
      lastAuthenticatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Portail admin ouvert.",
    };
  };

  const logout = () => {
    setSession(defaultAdminSession);
  };

  const updateHarasCredential = (
    harasId: string,
    code: string,
    updatedBy: string,
  ) => {
    const timestamp = new Date().toISOString();

    setDirectory((currentDirectory) => ({
      ...currentDirectory,
      harasCredentials: currentDirectory.harasCredentials.map((credential) =>
        credential.harasId === harasId
          ? {
              ...credential,
              code,
              updatedAt: timestamp,
              updatedBy,
            }
          : credential,
      ),
    }));
  };

  const upsertManagedUser = (input: ManagedUserInput) => {
    const timestamp = new Date().toISOString();
    const existing = directory.managedUsers.find((user) => user.id === input.id);
    const nextUser: ManagedUser = {
      ...input,
      id: input.id ?? buildId("managed-user"),
      createdAt: input.createdAt ?? existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      lastPasswordUpdate:
        existing?.lastPasswordUpdate ?? input.lastPasswordUpdate ?? timestamp,
    };

    setDirectory((currentDirectory) => ({
      ...currentDirectory,
      managedUsers: currentDirectory.managedUsers.some(
        (user) => user.id === nextUser.id,
      )
        ? currentDirectory.managedUsers.map((user) =>
            user.id === nextUser.id ? nextUser : user,
          )
        : [nextUser, ...currentDirectory.managedUsers],
    }));

    return nextUser;
  };

  const updateManagedUserPassword = (userId: string, password: string) => {
    const timestamp = new Date().toISOString();

    setDirectory((currentDirectory) => ({
      ...currentDirectory,
      managedUsers: currentDirectory.managedUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              password,
              updatedAt: timestamp,
              lastPasswordUpdate: timestamp,
            }
          : user,
      ),
    }));
  };

  const updateManagedUserStatus = (
    userId: string,
    status: ManagedUser["status"],
  ) => {
    const timestamp = new Date().toISOString();

    setDirectory((currentDirectory) => ({
      ...currentDirectory,
      managedUsers: currentDirectory.managedUsers.map((user) =>
        user.id === userId ? { ...user, status, updatedAt: timestamp } : user,
      ),
    }));
  };

  const deleteManagedUser = (userId: string) => {
    setDirectory((currentDirectory) => ({
      ...currentDirectory,
      managedUsers: currentDirectory.managedUsers.filter((user) => user.id !== userId),
    }));
  };

  const updateAdminAccountPassword = (adminId: string, password: string) => {
    const timestamp = new Date().toISOString();

    setDirectory((currentDirectory) => ({
      ...currentDirectory,
      adminAccounts: currentDirectory.adminAccounts.map((account) =>
        account.id === adminId
          ? {
              ...account,
              password,
              updatedAt: timestamp,
              lastPasswordUpdate: timestamp,
            }
          : account,
      ),
    }));
  };

  const resetDirectory = () => {
    setDirectory(getDefaultAdminDirectory());
    setSession(defaultAdminSession);
    removeLocalStorage(ADMIN_DIRECTORY_STORAGE_KEY);
    removeLocalStorage(ADMIN_SESSION_STORAGE_KEY);
    writeLocalStorage(ADMIN_STORAGE_VERSION_KEY, ADMIN_STORAGE_VERSION);
  };

  const getUsersForScope = (harasId: string, centreId?: string) =>
    directory.managedUsers.filter((user) => {
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

  const value = useMemo<AdminProviderValue>(
    () => ({
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
      getUsersForScope,
    }),
    [directory, hydrated, session],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdminProvider = () => {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdminProvider must be used within AdminProvider");
  }

  return context;
};
