"use client";

import Link from "next/link";
import { Expand, Share2, X } from "lucide-react";

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
  <aside className="sticky top-24 h-fit rounded-[1.75rem] bg-[rgba(245,247,251,0.92)] p-2 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.18)] backdrop-blur">
    <div className="rounded-[1.4rem] bg-white/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      {item ? (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="section-caption">{item.detailEyebrow}</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                {item.detailTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button asChild variant="outline" size="icon">
                <Link href={item.href}>
                  <Expand className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" onClick={onClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(17,24,39,0.96),rgba(44,83,164,0.9))] p-5 text-white shadow-[0_22px_50px_-32px_rgba(15,23,42,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
                  Highlight
                </p>
                <h3 className="text-xl font-semibold">{item.highlightTitle}</h3>
                <p className="max-w-md text-sm leading-7 text-white/72">{item.highlightText}</p>
              </div>
              <Badge variant={item.badgeVariant}>{item.badge}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Description
            </p>
            <p className="text-sm leading-7 text-slate-500">{item.detailDescription}</p>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Attachments
            </p>
            <div className="space-y-3">
              {item.attachments.map((attachment) => (
                <AttachmentItem key={attachment.id} attachment={attachment} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Comments
            </p>
            <div className="space-y-4">
              {item.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
          Sélectionnez une carte pour afficher le détail.
        </div>
      )}
    </div>
  </aside>
);
