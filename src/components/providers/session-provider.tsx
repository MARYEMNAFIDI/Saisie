"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { defaultRole } from "@/data/roles";
import { verifyAccessRequest } from "@/lib/access-service";
import { hasPermission } from "@/lib/permissions";
import {
  removeLocalStorage,
  readLocalStorage,
  writeLocalStorage,
} from "@/lib/storage";
import { AccessRequest, AccessSession, Permission, UserRole } from "@/types/domain";

const SESSION_STORAGE_KEY = "equine-prototype-session";
const SESSION_STORAGE_VERSION_KEY = "equine-prototype-session-version";
const SESSION_STORAGE_VERSION = 2;

const defaultSession: AccessSession = {
  status: "idle",
  scope: null,
  harasId: null,
  centreId: null,
  role: defaultRole,
  userId: null,
  username: null,
  displayName: null,
  lastValidatedAt: null,
};

interface SessionContextValue {
  session: AccessSession;
  hydrated: boolean;
  authenticate: (request: AccessRequest) => ReturnType<typeof verifyAccessRequest>;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  canAccessHaras: (harasId: string) => boolean;
  canAccessCentre: (harasId: string, centreId: string) => boolean;
  can: (permission: Permission) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AccessSession>(defaultSession);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedVersion = readLocalStorage<number>(SESSION_STORAGE_VERSION_KEY, 0);

    if (storedVersion !== SESSION_STORAGE_VERSION) {
      removeLocalStorage(SESSION_STORAGE_KEY);
      writeLocalStorage(SESSION_STORAGE_VERSION_KEY, SESSION_STORAGE_VERSION);
      setSession(defaultSession);
      setHydrated(true);
      return;
    }

    const stored = readLocalStorage<AccessSession | null>(
      SESSION_STORAGE_KEY,
      null,
    );

    if (stored) {
      setSession(stored);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (session.status === "granted") {
      writeLocalStorage(SESSION_STORAGE_KEY, session);
      return;
    }

    removeLocalStorage(SESSION_STORAGE_KEY);
  }, [hydrated, session]);

  const authenticate: SessionContextValue["authenticate"] = async (request) => {
    setSession({
      status: "pending",
      scope: request.scope,
      harasId: request.harasId,
      centreId: request.scope === "centre" ? request.centreId ?? null : null,
      role: request.role,
      userId: request.userId ?? null,
      username: null,
      displayName: null,
      lastValidatedAt: null,
    });

    const result = await verifyAccessRequest(request);

    if (!result.success || !result.session) {
      setSession({
        status: "denied",
        scope: request.scope,
        harasId: request.harasId,
        centreId: request.scope === "centre" ? request.centreId ?? null : null,
        role: request.role,
        userId: request.userId ?? null,
        username: null,
        displayName: null,
        lastValidatedAt: null,
      });

      return result;
    }

    setSession(result.session);
    return result;
  };

  const switchRole = (role: UserRole) => {
    setSession((currentSession) => ({
      ...currentSession,
      role,
    }));
  };

  const logout = () => {
    setSession(defaultSession);
  };

  const canAccessHaras = (harasId: string) =>
    session.status === "granted" && session.harasId === harasId;

  const canAccessCentre = (harasId: string, centreId: string) =>
    canAccessHaras(harasId) &&
    (session.scope === "haras" || session.centreId === centreId);

  const can = (permission: Permission) => hasPermission(session.role, permission);

  return (
    <SessionContext.Provider
      value={{
        session,
        hydrated,
        authenticate,
        switchRole,
        logout,
        canAccessHaras,
        canAccessCentre,
        can,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
};
