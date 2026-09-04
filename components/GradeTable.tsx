"use client";

import { Eye, EyeOff } from "lucide-react";
import { SUBJECTS } from "@/lib/fixtures";
import { subjectDeviationDisplay } from "@/lib/subject-statistics";
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
      <div className="border-b border-black/10 bg-black p-6 text-white sm:px-8 sm:py-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Subjects</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">科目成績</h2>
        <p className="mt-2 text-sm font-medium text-white/55">0〜100点で入力。科目ごとに公開 / 非公開を選べます。</p>
      </div>

      <div className="divide-y divide-black/10">
        {SUBJECTS.map((subject) => {
          const score = scores[subject.id];
          const stat = analytics[subject.id];
          const deviation = subjectDeviationDisplay(stat);
          const visibility = visibilities[subject.id] ?? "public";

          return (
            <div key={subject.id} className="grid gap-4 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_120px_145px] sm:items-center sm:px-8 sm:py-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="font-bold">{subject.name}</p>
                  <p className="text-xs font-medium text-black/35">{subject.credits}単位</p>
                </div>
                {stat ? (
                  <p className="mt-1 text-xs font-medium text-black/40">
                    {stat.rank ? `#${stat.rank} / ${stat.participantCount}` : "順位 —"}
                    {` · 偏差値 ${deviation.value}（${deviation.note}）`}
                  </p>
                ) : (
                  <p className="mt-1 text-xs font-medium text-black/30">保存後に順位・偏差値を表示</p>
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
                className="k-input py-2.5 font-mono font-bold"
              />

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="flex items-center gap-1.5 text-xs font-bold text-black/55">
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
