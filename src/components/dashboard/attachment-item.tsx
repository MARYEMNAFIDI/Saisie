"use client";

import Link from "next/link";
import { ArrowUpRight, Download, FileText } from "lucide-react";

import { DashboardAttachment } from "@/components/dashboard/types";

export const AttachmentItem = ({ attachment }: { attachment: DashboardAttachment }) => (
  <div className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 transition-colors hover:bg-slate-50">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{attachment.label}</p>
        <p className="text-xs text-slate-500">Ressource liée au flux métier</p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Link
        href={attachment.href}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-950"
      >
        <ArrowUpRight className="h-4 w-4" />
      </Link>
      <Link
        href={attachment.downloadHref ?? attachment.href}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-950"
      >
        <Download className="h-4 w-4" />
      </Link>
    </div>
  </div>
);
