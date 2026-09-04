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
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-bold tracking-[.14em] text-zinc-500">SUBJECT BOARDS</p>
        <h2 className="mt-1 text-xl font-black">科目別ランキング</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Privateの点数は数値を隠します。順位自体はランキング機能として表示されます。
        </p>
        <select
          value={effectiveSubjectId}
          onChange={(event) => setSelectedSubjectId(event.target.value)}
          className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm font-bold outline-none focus:border-lime-200/50"
        >
          {SUBJECTS.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="p-6 text-sm text-zinc-500">
          {subject?.name ?? "この科目"}にはまだ参加者データがありません。
        </div>
      ) : (
        <div>
          {rows.slice(0, 50).map((entry) => {
            const baseLabel = entry.displayName || entry.pseudonym;
            const label = entry.isMe ? `${baseLabel} · YOU` : baseLabel;
            return (
              <div
                key={`${effectiveSubjectId}-${entry.rank}-${entry.pseudonym}`}
                className={`grid grid-cols-[48px_minmax(0,1fr)_80px] items-center gap-2 border-b border-white/5 px-5 py-3 last:border-0 ${entry.isMe ? "bg-lime-200/10" : ""}`}
              >
                <span className="font-mono text-sm font-black">#{entry.rank}</span>
                <span className="truncate text-sm font-bold">{label}</span>
                <span className="text-right font-mono text-sm text-zinc-400">
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
