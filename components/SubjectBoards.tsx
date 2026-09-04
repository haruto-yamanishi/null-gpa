"use client";

import { useMemo, useState } from "react";
import { SUBJECTS } from "@/lib/fixtures";
import { subjectDeviationDisplay } from "@/lib/subject-statistics";
import type { SubjectRankingRow, SubjectStatistic } from "@/lib/types";
import { getPodiumTheme, RankDisplay } from "./RankDisplay";

export function SubjectBoards({
  boards,
  statistics,
}: {
  boards: Record<string, SubjectRankingRow[]>;
  statistics: Record<string, SubjectStatistic>;
}) {
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
  const statistic = statistics[effectiveSubjectId];
  const deviation = subjectDeviationDisplay(statistic);
  const participantCount = rows[0]?.participantCount ?? 0;

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

        {rows.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[4px] border border-black/10 bg-neutral-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">科目参加者</p>
              <p className="mt-1 font-mono text-xl font-black">{participantCount} <span className="text-xs text-black/35">/ 40</span></p>
            </div>
            <div className="rounded-[4px] border border-black/10 bg-neutral-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">あなたの偏差値</p>
              <p className="mt-1 font-mono text-xl font-black">{deviation.value}</p>
            </div>
            <p className="col-span-2 text-xs font-medium text-black/40">
              GPA参加者数とは別に、{deviation.note}。
            </p>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="p-7 text-sm font-medium text-black/40">{subject?.name ?? "この科目"}にはまだ参加者データがありません。</div>
      ) : (
        <div className="divide-y divide-black/10">
          {rows.slice(0, 50).map((entry) => {
            const podium = getPodiumTheme(entry.rank);
            const baseLabel = entry.displayName || entry.pseudonym;
            const seatLabel = entry.seatNumber == null ? "" : `No.${entry.seatNumber} · `;
            const label = `${seatLabel}${baseLabel}${entry.isMe ? " · YOU" : ""}`;
            return (
              <div
                key={`${effectiveSubjectId}-${entry.rank}-${entry.pseudonym}`}
                className={`grid grid-cols-[88px_minmax(0,1fr)_88px] items-center gap-2 px-6 py-4 ${podium?.row ?? (entry.isMe ? "bg-neutral-100" : "bg-white")}`}
              >
                <RankDisplay rank={entry.rank} />
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
