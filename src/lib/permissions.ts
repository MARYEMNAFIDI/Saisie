import { rolesById } from "@/data/roles";
import { Permission, UserRole } from "@/types/domain";

export const hasPermission = (role: UserRole, permission: Permission) =>
  rolesById[role].permissions.includes(permission);

export const getRoleCapabilities = (role: UserRole) => ({
  canView: hasPermission(role, "view"),
  canEdit: hasPermission(role, "edit"),
  canExport: hasPermission(role, "export"),
  canManageCentres: hasPermission(role, "manage_centres"),
  isReadOnly: !hasPermission(role, "edit"),
});
