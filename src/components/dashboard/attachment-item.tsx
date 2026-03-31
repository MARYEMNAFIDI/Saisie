"use client";

import Link from "next/link";
import { ArrowUpRight, Download, FileText } from "lucide-react";

import { DashboardAttachment } from "@/components/dashboard/types";

export const AttachmentItem = ({ attachment }: { attachment: DashboardAttachment }) => (
  <div className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-white/70 bg-white/76 p-4 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.14)] backdrop-blur-xl">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 shadow-[0_16px_32px_-24px_rgba(180,83,9,0.28)]">
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{attachment.label}</p>
        <p className="text-xs text-slate-500">Ressource operationnelle liee au flux</p>
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-2">
      <Link
        href={attachment.href}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-950"
      >
        <ArrowUpRight className="h-4 w-4" />
      </Link>
      <Link
        href={attachment.downloadHref ?? attachment.href}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-950"
      >
        <Download className="h-4 w-4" />
      </Link>
    </div>
  </div>
);
