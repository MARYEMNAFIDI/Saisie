export type UserRole = "viewer" | "editor" | "exporter" | "local_admin";
export type Permission = "view" | "edit" | "export" | "manage_centres";
export type AccessScope = "haras" | "centre";
export type CentreType = "centre" | "station" | "national_center";
export type ManagedUserStatus = "active" | "suspended";
export type AdminAccountLevel = "super_admin" | "security_admin";
export type SyncStatus = "synchronise" | "surveillance" | "prioritaire";
export type AdmissionStatus = "acceptee" | "refusee";
export type ProductSex = "Male" | "Femelle";
export type DeclarationStatus = "Declaree" | "Non declaree";
export type IdentificationStatus = "Identifie" | "En attente";
export type ProductStatus = "Declare" | "En attente" | "A confirmer";

export interface Centre {
  id: string;
  harasId: string;
  name: string;
  type: CentreType;
  region: string;
  manager: string;
  activeMares: number;
  pendingReviews: number;
  status: SyncStatus;
}

export interface HarasPalette {
  from: string;
  via: string;
  to: string;
  glow: string;
  ring: string;
}

export interface Haras {
  id: string;
  name: string;
  shortName: string;
  city: string;
  accessCode: string;
  description: string;
  statusLabel: string;
  coverImage?: string;
  palette: HarasPalette;
  centres: Centre[];
  stats: {
    centreCount: number;
    activeForms: number;
    pendingReviews: number;
    status: string;
  };
}

export interface MareRecord {
  id: string;
  harasId: string;
  centreId: string;
  season: string;
  name: string;
  farasNumber: string;
  transponderNumber: string;
  breed: string;
  birthDate: string;
  coat: string;
  stallionPrimary: string;
  stallionSecondary: string;
  owner: string;
  phone: string;
  commune: string;
  breedingAddress: string;
  history: string;
  weightKg: string;
  physiologicalStatus: string;
  bcs: string;
  vulvaConformation: string;
  admissionStatus: AdmissionStatus;
  refusalReason: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ReproductionRecord {
  id: string;
  mareId: string;
  harasId: string;
  centreId: string;
  season: string;
  stallion: string;
  stallionFarasNumber: string;
  stallionBirthDate: string;
  stallionBreed: string;
  stallionCategory: string;
  matingType: string;
  firstCycleDate: string;
  secondCycleDate: string;
  thirdCycleDate: string;
  fourthCycleDate: string;
  totalCycles: number;
  fertileCycles: number;
  nonFertileCycles: number;
  cycleResult: string;
  diagnosis: string;
  dpsNumber: string;
  farasEntryStatus: "OUI" | "NON";
  farasEntryReason: string;
  previousProductSirema: string;
  previousProductBirthDate: string;
  previousProductSex: ProductSex;
  previousProductBreed: string;
  previousProductDeclaration: "OUI" | "NON";
  previousProductIdentification: "OUI" | "NON";
  heatReturn: boolean;
  abortion: boolean;
  embryoResorption: boolean;
  nonOvulation: boolean;
  uterineInfection: boolean;
  twinPregnancy: boolean;
  traumaticAccident: boolean;
  followUpDate: string;
  bValue: string;
  leftOvary: string;
  rightOvary: string;
  uterus: string;
  fluid: string;
  followUpComment: string;
  latestFinding: string;
  observations: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProductRecord {
  id: string;
  mareId: string;
  harasId: string;
  centreId: string;
  season: string;
  previousProduct: string;
  siremaProduct: string;
  birthDate: string;
  sex: ProductSex;
  breed: string;
  declaration: DeclarationStatus;
  identification: IdentificationStatus;
  productStatus: ProductStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RoleConfig {
  id: UserRole;
  label: string;
  description: string;
  permissions: Permission[];
  badge: string;
  accent: string;
  supportText: string;
}

export interface AccessSession {
  status: "idle" | "pending" | "granted" | "denied";
  scope: AccessScope | null;
  harasId: string | null;
  centreId: string | null;
  role: UserRole;
  userId: string | null;
  username: string | null;
  displayName: string | null;
  lastValidatedAt: string | null;
}

export interface AccessRequest {
  harasId: string;
  scope: AccessScope;
  centreId?: string;
  code?: string;
  password?: string;
  role: UserRole;
  userId?: string;
}

export interface AccessResult {
  success: boolean;
  message: string;
  session?: AccessSession;
}

export interface RecordFilters {
  search: string;
  harasId: string;
  centreId: string;
  season: string;
  breed: string;
}

export interface ManagedUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  status: ManagedUserStatus;
  harasIds: string[];
  centreIds: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastPasswordUpdate: string;
}

export interface HarasCredential {
  harasId: string;
  code: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AdminAccount {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  level: AdminAccountLevel;
  createdAt: string;
  updatedAt: string;
  lastPasswordUpdate: string;
}

export interface AdminDirectoryState {
  adminAccounts: AdminAccount[];
  managedUsers: ManagedUser[];
  harasCredentials: HarasCredential[];
}

export interface AdminSession {
  status: "locked" | "authenticated";
  adminId: string | null;
  username: string | null;
  fullName: string | null;
  lastAuthenticatedAt: string | null;
}
