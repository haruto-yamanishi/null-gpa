"use client";

import type { RankingRow } from "@/lib/types";

export function RankingBoard({ board }: { board: RankingRow[] }) {
  const participantCount = board[0]?.participantCount ?? 0;

  return (
    <section className="k-card overflow-hidden">
      <div className="border-b border-black/10 p-6 sm:p-7">
        <p className="k-label">GPA ranking</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">GPAランキング</h2>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-bold text-black/45">
          <span>参加者内順位</span>
          <span>参加者 {participantCount} / 40</span>
        </div>
      </div>

      {board.length === 0 ? (
        <div className="p-7 text-sm font-medium text-black/40">まだランキングデータがありません。</div>
      ) : (
        <div className="divide-y divide-black/10">
          {board.slice(0, 50).map((entry) => {
            const baseLabel = entry.displayName || entry.pseudonym;
            const seatLabel = entry.seatNumber == null ? "" : `No.${entry.seatNumber} · `;
            const label = `${seatLabel}${baseLabel}${entry.isMe ? " · YOU" : ""}`;

            return (
              <div
                key={`${entry.rank}-${entry.pseudonym}`}
                className={`grid grid-cols-[52px_minmax(0,1fr)_88px] items-center gap-2 px-6 py-4 ${entry.isMe ? "bg-neutral-100" : "bg-white"}`}
              >
                <span className="font-mono text-base font-black">#{entry.rank}</span>
                <span className="truncate text-sm font-bold">{label}</span>
                <span className="text-right font-mono text-sm font-bold text-black/45">
                  {entry.gpa == null ? "hidden" : entry.gpa.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
