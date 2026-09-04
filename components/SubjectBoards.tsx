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
      <div className="border-b border-black/10 p-6 sm:p-7">
        <p className="k-label">Subject ranking</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">科目別ランキング</h2>
        <p className="mt-2 text-xs font-medium text-black/40">Privateの点数・出席番号は数値を表示しません。</p>
        <select
          value={effectiveSubjectId}
          onChange={(event) => setSelectedSubjectId(event.target.value)}
          className="mt-5 w-full rounded-[4px] border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-black"
        >
          {SUBJECTS.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="p-7 text-sm font-medium text-black/40">{subject?.name ?? "この科目"}にはまだ参加者データがありません。</div>
      ) : (
        <div className="divide-y divide-black/10">
          {rows.slice(0, 50).map((entry) => {
            const baseLabel = entry.displayName || entry.pseudonym;
            const seatLabel = entry.seatNumber == null ? "" : `No.${entry.seatNumber} · `;
            const label = `${seatLabel}${baseLabel}${entry.isMe ? " · YOU" : ""}`;
            return (
              <div
                key={`${effectiveSubjectId}-${entry.rank}-${entry.pseudonym}`}
                className={`grid grid-cols-[52px_minmax(0,1fr)_88px] items-center gap-2 px-6 py-4 ${entry.isMe ? "bg-neutral-100" : "bg-white"}`}
              >
                <span className="font-mono text-base font-black">#{entry.rank}</span>
                <span className="truncate text-sm font-bold">{label}</span>
                <span className="text-right font-mono text-sm font-bold text-black/45">
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
