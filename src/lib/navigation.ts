import { AccessScope } from "@/types/domain";

export const buildAccessPath = (
  harasId: string,
  scope: AccessScope,
  centreId?: string,
) => {
  const params = new URLSearchParams({ scope });

  if (centreId) {
    params.set("centreId", centreId);
  }

  return `/haras/${harasId}/access?${params.toString()}`;
};

export const buildDashboardPath = (
  harasId: string,
  scope: AccessScope,
  centreId?: string | null,
) =>
  scope === "centre" && centreId
    ? `/haras/${harasId}/centres/${centreId}/dashboard`
    : `/haras/${harasId}/dashboard`;

export const buildWorkspacePath = (harasId: string, segment: string) =>
  `/haras/${harasId}/${segment}`;
