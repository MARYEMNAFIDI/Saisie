import { type LucideIcon } from "lucide-react";

export type DashboardFilter = {
  id: string;
  label: string;
  count?: string;
};

export type DashboardMetaItem = {
  icon: LucideIcon;
  label: string;
};

export type DashboardAttachment = {
  id: string;
  label: string;
  href: string;
  downloadHref?: string;
};

export type DashboardComment = {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  message: string;
};

export type DashboardItem = {
  id: string;
  section: string;
  filterId: string;
  title: string;
  description: string;
  badge: string;
  badgeVariant:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "danger"
    | "info";
  href: string;
  meta: DashboardMetaItem[];
  detailEyebrow: string;
  detailTitle: string;
  detailDescription: string;
  highlightTitle: string;
  highlightText: string;
  attachments: DashboardAttachment[];
  comments: DashboardComment[];
};
