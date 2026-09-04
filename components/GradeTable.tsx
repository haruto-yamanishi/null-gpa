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
    <section className="k-card overflow-hidden">
      <div className="border-b-2 border-black bg-[#2864ff] p-6 text-white sm:px-8">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/65">Subjects</p>
        <h2 className="mt-1 text-3xl font-black tracking-tight">科目成績</h2>
        <p className="mt-2 text-sm font-bold text-white/70">0〜100点で入力。科目ごとに公開 / 非公開を選べます。</p>
      </div>

      <div className="divide-y-2 divide-black">
        {SUBJECTS.map((subject, index) => {
          const score = scores[subject.id];
          const stat = analytics[subject.id];
          const visibility = visibilities[subject.id] ?? "public";

          return (
            <div key={subject.id} className={`grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_120px_145px] sm:items-center sm:px-8 ${index % 2 === 0 ? "bg-white" : "bg-[#faf8f2]"}`}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="font-black">{subject.name}</p>
                  <p className="text-xs font-bold text-black/40">{subject.credits} credits</p>
                </div>
                {stat ? (
                  <p className="mt-1 text-xs font-bold text-black/45">
                    {stat.rank ? `#${stat.rank} / ${stat.participantCount}` : "順位 —"}
                    {stat.deviation == null ? " · 偏差値は10人以上で表示" : ` · 偏差値 ${stat.deviation.toFixed(1)}`}
                  </p>
                ) : (
                  <p className="mt-1 text-xs font-bold text-black/35">保存後に順位・偏差値を表示</p>
                )}
              </div>

              <input
                aria-label={`${subject.name} score`}
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="—"
                value={score ?? ""}
                onChange={(event) => {
                  if (event.target.value === "") {
                    onScoreChange(subject.id, null);
                    return;
                  }
                  const next = Number(event.target.value);
                  onScoreChange(subject.id, Number.isFinite(next) ? Math.min(100, Math.max(0, next)) : null);
                }}
                className="k-input py-2.5 font-mono font-black"
              />

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="flex items-center gap-1.5 text-xs font-black">
                  {visibility === "public" ? <Eye size={15} /> : <EyeOff size={15} />}
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
