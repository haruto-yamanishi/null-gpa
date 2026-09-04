"use client";

import type { RankingRow } from "@/lib/types";

export function RankingBoard({ board }: { board: RankingRow[] }) {
  return (
    <section className="k-card overflow-hidden">
      <div className="border-b-2 border-black bg-[#ffd84d] p-6">
        <p className="k-label">GPA ranking</p>
        <h2 className="mt-1 text-3xl font-black tracking-tight">GPAランキング</h2>
        <p className="mt-2 text-xs font-bold text-black/50">参加者内順位</p>
      </div>

      {board.length === 0 ? (
        <div className="p-7 text-sm font-bold text-black/45">まだランキングデータがありません。</div>
      ) : (
        <div className="divide-y-2 divide-black">
          {board.slice(0, 50).map((entry) => {
            const baseLabel = entry.displayName || entry.pseudonym;
            const label = entry.isMe ? `${baseLabel} · YOU` : baseLabel;

            return (
              <div
                key={`${entry.rank}-${entry.pseudonym}`}
                className={`grid grid-cols-[52px_minmax(0,1fr)_88px] items-center gap-2 px-6 py-4 ${entry.isMe ? "bg-[#8fe0c0]/45" : "bg-white"}`}
              >
                <span className="font-mono text-base font-black">#{entry.rank}</span>
                <span className="truncate text-sm font-black">{label}</span>
                <span className="text-right font-mono text-sm font-black text-black/55">
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
