import { getHarasById } from "@/data/haras";
import { getManagedUserById } from "@/lib/admin-storage";
import { AccessRequest, AccessResult } from "@/types/domain";

import { wait } from "@/lib/utils";

export const verifyAccessRequest = async (
  request: AccessRequest,
): Promise<AccessResult> => {
  await wait(900);

  const haras = getHarasById(request.harasId);

  if (!haras) {
    return {
      success: false,
      message: "Le haras cible est introuvable dans le referentiel local.",
    };
  }

  const managedUser = request.userId ? getManagedUserById(request.userId) : undefined;

  if (request.userId && !managedUser) {
    return {
      success: false,
      message: "Le profil utilisateur selectionne n'existe plus.",
    };
  }

  if (managedUser && managedUser.status !== "active") {
    return {
      success: false,
      message: "Ce profil utilisateur est suspendu et ne peut pas se connecter.",
    };
  }

  if (managedUser && request.password !== managedUser.password) {
    return {
      success: false,
      message: "Mot de passe utilisateur invalide.",
    };
  }

  if (managedUser && !managedUser.harasIds.includes(request.harasId)) {
    return {
      success: false,
      message: "Le profil utilisateur n'est pas autorise sur ce haras.",
    };
  }

  if (
    managedUser &&
    request.scope === "centre" &&
    request.centreId &&
    managedUser.centreIds.length > 0 &&
    !managedUser.centreIds.includes(request.centreId)
  ) {
    return {
      success: false,
      message: "Le profil utilisateur n'est pas autorise sur ce centre.",
    };
  }

  return {
    success: true,
    message: `Acces valide pour ${haras.name}. Redirection vers l'espace autorise...`,
    session: {
      status: "granted",
      scope: request.scope,
      harasId: request.harasId,
      centreId: request.scope === "centre" ? request.centreId ?? null : null,
      role: managedUser?.role ?? request.role,
      userId: managedUser?.id ?? null,
      username: managedUser?.username ?? null,
      displayName: managedUser?.fullName ?? null,
      lastValidatedAt: new Date().toISOString(),
    },
  };
};

