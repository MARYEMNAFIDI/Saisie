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
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
      {getInitials(comment.author)}
    </div>
    <div className="min-w-0 flex-1 rounded-[1.1rem] bg-white px-4 py-3 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.18)]">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="font-semibold text-slate-900">{comment.author}</span>
        <span>{comment.role}</span>
        <span>{comment.timestamp}</span>
      </div>
      <p className="mt-2 text-sm leading-7 text-slate-500">{comment.message}</p>
    </div>
  </div>
);
