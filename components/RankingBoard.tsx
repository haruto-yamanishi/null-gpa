"use client";

import type { RankingRow } from "@/lib/types";

export function RankingBoard({ board }: { board: RankingRow[] }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-bold tracking-[.14em] text-zinc-500">LIVE BOARD</p>
        <h2 className="mt-1 text-xl font-black">GPAランキング</h2>
        <p className="mt-1 text-xs text-zinc-500">参加者内順位。学校公式順位ではありません。</p>
      </div>

      {board.length === 0 ? (
        <div className="p-6 text-sm text-zinc-500">
          まだランキングデータがありません。成績を入力して「ランキングに参加 / 更新」を押すと反映されます。
        </div>
      ) : (
        <div>
          {board.slice(0, 50).map((entry) => {
            const label = entry.displayName
              ? `${entry.displayName}${entry.isMe ? " · YOU" : ""}`
              : entry.isMe
                ? `YOU · ${entry.pseudonym}`
                : entry.pseudonym;

            return (
              <div
                key={`${entry.rank}-${entry.pseudonym}`}
                className={`grid grid-cols-[48px_minmax(0,1fr)_80px] items-center gap-2 border-b border-white/5 px-5 py-3 last:border-0 ${entry.isMe ? "bg-lime-200/10" : ""}`}
              >
                <span className="font-mono text-sm font-black">#{entry.rank}</span>
                <span className="truncate text-sm font-bold">{label}</span>
                <span className="text-right font-mono text-sm text-zinc-400">
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
