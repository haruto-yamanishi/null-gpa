"use client";

import type { IdentityMode } from "@/lib/types";
import type { gpaBoard } from "@/lib/leaderboard";

type Board = ReturnType<typeof gpaBoard>;

export function RankingBoard({
  board,
  accountId,
  identityMode,
  displayName,
}: {
  board: Board;
  accountId: string;
  identityMode: IdentityMode;
  displayName: string;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-bold tracking-[.14em] text-zinc-500">LIVE BOARD</p>
        <h2 className="mt-1 text-xl font-black">GPAランキング</h2>
        <p className="mt-1 text-xs text-zinc-500">参加者内順位。学校公式順位ではありません。</p>
      </div>

      <div>
        {board.slice(0, 30).map((entry) => {
          const isMe = entry.participant.accountId === accountId;
          const label = isMe
            ? identityMode === "named"
              ? displayName || "YOU"
              : "YOU · Q7M4-K2PD"
            : entry.participant.identityMode === "named" && entry.participant.displayName
              ? entry.participant.displayName
              : `ANON-${entry.participant.accountId.slice(-2).toUpperCase()}••`;

          return (
            <div
              key={entry.participant.accountId}
              className={`grid grid-cols-[48px_minmax(0,1fr)_80px] items-center gap-2 border-b border-white/5 px-5 py-3 last:border-0 ${isMe ? "bg-lime-200/10" : ""}`}
            >
              <span className="font-mono text-sm font-black">#{entry.rank}</span>
              <span className="truncate text-sm font-bold">{label}</span>
              <span className="text-right font-mono text-sm text-zinc-400">
                {entry.participant.gpaVisibility === "public" ? entry.gpa.toFixed(2) : "hidden"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
