"use client";

import { Eye, EyeOff } from "lucide-react";
import { SUBJECTS } from "@/lib/fixtures";
import type { SubjectStatistic, Visibility } from "@/lib/types";
import { Toggle } from "./Toggle";

export function GradeTable({
  scores,
  visibilities,
  analytics,
  onScoreChange,
  onVisibilityChange,
}: {
  scores: Record<string, number | null>;
  visibilities: Record<string, Visibility>;
  analytics: Record<string, SubjectStatistic>;
  onScoreChange: (subjectId: string, score: number | null) => void;
  onVisibilityChange: (subjectId: string, visibility: Visibility) => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <p className="text-xs font-bold tracking-[.14em] text-zinc-500">GRADE INPUT</p>
        <h2 className="mt-1 text-2xl font-black">科目成績</h2>
      </div>

      <div className="divide-y divide-white/10">
        {SUBJECTS.map((subject) => {
          const score = scores[subject.id];
          const stat = analytics[subject.id];
          const visibility = visibilities[subject.id] ?? "private";

          return (
            <div key={subject.id} className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_110px_130px] sm:items-center sm:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="font-bold">{subject.name}</p>
                  <p className="text-xs text-zinc-500">{subject.credits} credits</p>
                </div>
                {stat ? (
                  <p className="mt-1 text-xs text-zinc-500">
                    {stat.rank ? `#${stat.rank} / ${stat.participantCount} participants` : "順位 —"}
                    {stat.deviation == null ? " · 偏差値は10人以上で表示" : ` · 偏差値 ${stat.deviation.toFixed(1)}`}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-zinc-600">保存後に参加者内順位・偏差値を表示</p>
                )}
              </div>

              <input
                aria-label={`${subject.name} score`}
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={score ?? ""}
                onChange={(event) => {
                  if (event.target.value === "") {
                    onScoreChange(subject.id, null);
                    return;
                  }
                  const next = Number(event.target.value);
                  onScoreChange(subject.id, Number.isFinite(next) ? Math.min(100, Math.max(0, next)) : null);
                }}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 font-mono font-bold outline-none focus:border-lime-200/50"
              />

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                  {visibility === "public" ? <Eye size={14} /> : <EyeOff size={14} />}
                  {visibility === "public" ? "Public" : "Private"}
                </span>
                <Toggle
                  checked={visibility === "public"}
                  onChange={(value) => onVisibilityChange(subject.id, value ? "public" : "private")}
                  label={`${subject.name} visibility`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
