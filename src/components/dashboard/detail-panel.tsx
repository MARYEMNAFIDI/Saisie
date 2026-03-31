"use client";

import Link from "next/link";
import { ArrowUpRight, Share2, X } from "lucide-react";

import { AttachmentItem } from "@/components/dashboard/attachment-item";
import { CommentItem } from "@/components/dashboard/comment-item";
import { DashboardItem } from "@/components/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const DetailPanel = ({
  item,
  onShare,
  onClear,
}: {
  item: DashboardItem | null;
  onShare: () => void;
  onClear: () => void;
}) => (
  <aside className="sticky top-24 h-fit">
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(244,247,251,0.92))] p-2 shadow-[0_36px_80px_-46px_rgba(15,23,42,0.26)] backdrop-blur-2xl">
      {item ? (
        <div className="space-y-6 rounded-[calc(2rem-6px)] border border-white/60 bg-white/72 p-5 backdrop-blur-xl lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="section-caption">{item.detailEyebrow}</p>
                <Badge variant={item.badgeVariant}>{item.badge}</Badge>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                {item.detailTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="bg-white/70" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button asChild variant="outline" size="icon" className="bg-white/70">
                <Link href={item.href}>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" className="bg-white/70" onClick={onClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-amber-100 bg-[linear-gradient(145deg,rgba(255,252,245,0.98),rgba(255,255,255,0.96)_55%,rgba(239,246,255,0.94))] p-5 text-slate-950 shadow-[0_24px_52px_-36px_rgba(15,23,42,0.16)]">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Highlight
              </p>
              <h3 className="text-2xl font-semibold tracking-tight">{item.highlightTitle}</h3>
              <p className="max-w-md text-sm leading-7 text-slate-500">{item.highlightText}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {item.meta.map((meta) => {
              const Icon = meta.icon;

              return (
                <span
                  key={`${item.id}-${meta.label}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-500"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {meta.label}
                </span>
              );
            })}
          </div>

          <div className="space-y-2">
            <p className="section-caption">Description</p>
            <p className="text-sm leading-7 text-slate-500">{item.detailDescription}</p>
          </div>

          <div className="space-y-3">
            <p className="section-caption">Attachments</p>
            <div className="space-y-3">
              {item.attachments.map((attachment) => (
                <AttachmentItem key={attachment.id} attachment={attachment} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="section-caption">Comments</p>
            <div className="space-y-4">
              {item.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[calc(2rem-6px)] border border-dashed border-slate-200/90 bg-white/70 p-10 text-center">
          <p className="text-base font-semibold text-slate-950">Aucun module selectionne</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Choisissez une carte pour ouvrir une lecture detaillee, partager le
            raccourci ou lancer l'action associee.
          </p>
        </div>
      )}
    </div>
  </aside>
);
