"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { loadRankings } from "@/lib/supabase/submission";
import type { RankingRow, SubjectRankingRow } from "@/lib/types";
import { RankingBoard } from "./RankingBoard";
import { SubjectBoards } from "./SubjectBoards";

export function RankingsPage() {
  const [board, setBoard] = useState<RankingRow[]>([]);
  const [subjectBoards, setSubjectBoards] = useState<Record<string, SubjectRankingRow[]>>({});
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  async function refresh() {
    setState("loading");
    setMessage("");
    try {
      const result = await loadRankings();
      setBoard(result.board);
      setSubjectBoards(result.subjectBoards);
      setState("ready");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "ランキングの取得に失敗しました。");
      setState("error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="k-label">Rankings</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">ランキング</h1>
          <p className="mt-3 text-sm font-medium text-black/55">GPAと科目ごとの参加者内順位を表示します。</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={state === "loading"} className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2.5 text-sm font-black shadow-[2px_2px_0_#111] disabled:opacity-50">
          <RefreshCw size={16} className={state === "loading" ? "animate-spin" : ""} />
          更新
        </button>
      </div>

      {state === "error" && (
        <div className="mb-6 rounded-2xl border-2 border-black bg-[#ff7768]/25 p-4 text-sm font-bold">{message}</div>
      )}

      {state === "loading" && board.length === 0 ? (
        <div className="k-card p-10 text-center text-sm font-black text-black/45">読み込み中…</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <RankingBoard board={board} />
          <SubjectBoards boards={subjectBoards} />
        </div>
      )}
    </main>
  );
}
