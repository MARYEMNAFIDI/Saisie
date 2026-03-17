import { RoleConfig, UserRole } from "@/types/domain";

export const roleConfigs: RoleConfig[] = [
  {
    id: "viewer",
    label: "Lecture seule",
    description:
      "Consultation des fiches et du suivi sans modification ni validation.",
    permissions: ["view"],
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    accent: "text-slate-700",
    supportText: "Parcours de supervision ou consultation terrain.",
  },
  {
    id: "editor",
    label: "Lecture + modification",
    description:
      "Saisie et mise à jour des formulaires, avec enregistrement local simulé.",
    permissions: ["view", "edit"],
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accent: "text-emerald-700",
    supportText: "Profil d'agent de saisie sur centre ou sur haras.",
  },
  {
    id: "exporter",
    label: "Lecture + modification + téléchargement",
    description:
      "Accès aux mêmes formulaires que l'éditeur avec capacité d'export local.",
    permissions: ["view", "edit", "export"],
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    accent: "text-amber-700",
    supportText: "Profil orienté contrôle qualité et consolidation des données.",
  },
  {
    id: "local_admin",
    label: "Administrateur local de haras",
    description:
      "Vision transversale du haras, supervision des centres et accès aux exports.",
    permissions: ["view", "edit", "export", "manage_centres"],
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    accent: "text-rose-700",
    supportText: "Profil de coordination locale et de pilotage de campagne.",
  },
];

export const rolesById = Object.fromEntries(
  roleConfigs.map((role) => [role.id, role]),
) as Record<UserRole, RoleConfig>;

export const defaultRole: UserRole = "editor";
