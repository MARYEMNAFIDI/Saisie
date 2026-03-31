"use client";

import { DashboardComment } from "@/components/dashboard/types";

const getInitials = (value: string) =>
  value
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const CommentItem = ({ comment }: { comment: DashboardComment }) => (
  <div className="flex gap-3">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fef3c7,#fde68a)] text-xs font-semibold text-amber-950 shadow-[0_16px_34px_-24px_rgba(180,83,9,0.22)]">
      {getInitials(comment.author)}
    </div>
    <div className="min-w-0 flex-1 rounded-[1.2rem] border border-white/70 bg-white/76 px-4 py-3 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.14)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="font-semibold text-slate-950">{comment.author}</span>
        <span>{comment.role}</span>
        <span>{comment.timestamp}</span>
      </div>
      <p className="mt-2 text-sm leading-7 text-slate-500">{comment.message}</p>
    </div>
  </div>
);
