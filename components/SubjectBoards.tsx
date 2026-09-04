"use client";

import { useMemo, useState } from "react";
import { SUBJECTS } from "@/lib/fixtures";
import type { SubjectRankingRow } from "@/lib/types";

export function SubjectBoards({ boards }: { boards: Record<string, SubjectRankingRow[]> }) {
  const availableSubjectIds = useMemo(
    () => SUBJECTS.filter((subject) => (boards[subject.id]?.length ?? 0) > 0).map((subject) => subject.id),
    [boards],
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(availableSubjectIds[0] ?? SUBJECTS[0]?.id ?? "");

  const effectiveSubjectId = availableSubjectIds.includes(selectedSubjectId)
    ? selectedSubjectId
    : (availableSubjectIds[0] ?? selectedSubjectId);
  const subject = SUBJECTS.find((item) => item.id === effectiveSubjectId);
  const rows = boards[effectiveSubjectId] ?? [];

  return (
    <section className="k-card overflow-hidden">
      <div className="border-b-2 border-black bg-[#8fe0c0] p-6">
        <p className="k-label">Subject ranking</p>
        <h2 className="mt-1 text-3xl font-black tracking-tight">科目別ランキング</h2>
        <p className="mt-2 text-xs font-bold text-black/50">Privateの点数は数値を表示しません。</p>
        <select
          value={effectiveSubjectId}
          onChange={(event) => setSelectedSubjectId(event.target.value)}
          className="mt-5 w-full rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm font-black outline-none"
        >
          {SUBJECTS.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="p-7 text-sm font-bold text-black/45">{subject?.name ?? "この科目"}にはまだ参加者データがありません。</div>
      ) : (
        <div className="divide-y-2 divide-black">
          {rows.slice(0, 50).map((entry) => {
            const baseLabel = entry.displayName || entry.pseudonym;
            const label = entry.isMe ? `${baseLabel} · YOU` : baseLabel;
            return (
              <div
                key={`${effectiveSubjectId}-${entry.rank}-${entry.pseudonym}`}
                className={`grid grid-cols-[52px_minmax(0,1fr)_88px] items-center gap-2 px-6 py-4 ${entry.isMe ? "bg-[#ffd84d]/45" : "bg-white"}`}
              >
                <span className="font-mono text-base font-black">#{entry.rank}</span>
                <span className="truncate text-sm font-black">{label}</span>
                <span className="text-right font-mono text-sm font-black text-black/55">
                  {entry.score == null ? "hidden" : entry.score.toFixed(0)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
