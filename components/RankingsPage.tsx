"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, RefreshCw } from "lucide-react";
import {
  beginRankingReentry,
  isRankingReentryInstalled,
  loadRankings,
  RANKING_ACCESS_REQUIRED,
  verifyRankingReentry,
  type RankingReentryChallenge,
} from "@/lib/supabase/submission";
import type { RankingRow, SubjectRankingRow } from "@/lib/types";
import { RankingBoard } from "./RankingBoard";
import { SubjectBoards } from "./SubjectBoards";

const VISIT_ACCESS_KEY = "null-gpa-ranking-access";

type AccessState = "checking" | "locked" | "challenge" | "ready";

export function RankingsPage() {
  const [board, setBoard] = useState<RankingRow[]>([]);
  const [subjectBoards, setSubjectBoards] = useState<Record<string, SubjectRankingRow[]>>({});
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [seatNumber, setSeatNumber] = useState("");
  const [challenge, setChallenge] = useState<RankingReentryChallenge | null>(null);
  const [challengeScore, setChallengeScore] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

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
      if (error instanceof Error && error.message === RANKING_ACCESS_REQUIRED) {
        sessionStorage.removeItem(VISIT_ACCESS_KEY);
        setAccessState("locked");
        setState("idle");
        setAuthMessage("ランキングを見るには成績登録または再認証が必要です。");
        return;
      }
      setMessage(error instanceof Error ? error.message : "ランキングの取得に失敗しました。");
      setState("error");
    }
  }

  useEffect(() => {
    async function initialize() {
      try {
        const installed = await isRankingReentryInstalled();
        if (!installed) {
          // Backward-compatible until migration 004 is applied in production.
          setAccessState("ready");
          await refresh();
          return;
        }

        if (sessionStorage.getItem(VISIT_ACCESS_KEY) === "1") {
          setAccessState("ready");
          await refresh();
          return;
        }

        setAccessState("locked");
      } catch (error) {
        console.error(error);
        setAccessState("locked");
        setAuthMessage(error instanceof Error ? error.message : "認証状態の確認に失敗しました。");
      }
    }

    void initialize();
  }, []);

  async function requestChallenge() {
    const parsedSeat = Number(seatNumber);
    if (!Number.isInteger(parsedSeat) || parsedSeat < 401 || parsedSeat > 440) {
      setAuthMessage("出席番号401〜440を入力してください。");
      return;
    }

    setAuthBusy(true);
    setAuthMessage("");
    try {
      const nextChallenge = await beginRankingReentry(parsedSeat);
      if (!nextChallenge) {
        setAuthMessage("その出席番号の登録済み成績が見つかりません。初回は成績を登録してください。");
        return;
      }
      setChallenge(nextChallenge);
      setChallengeScore("");
      setAccessState("challenge");
    } catch (error) {
      console.error(error);
      setAuthMessage(error instanceof Error ? error.message : "確認問題の作成に失敗しました。");
    } finally {
      setAuthBusy(false);
    }
  }

  async function verifyChallenge() {
    const parsedSeat = Number(seatNumber);
    const parsedScore = Number(challengeScore);
    if (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      setAuthMessage("0〜100の点数を入力してください。");
      return;
    }

    setAuthBusy(true);
    setAuthMessage("");
    try {
      const verified = await verifyRankingReentry(parsedSeat, parsedScore);
      if (!verified) {
        setAuthMessage("点数が一致しません。5回失敗すると確認問題を作り直す必要があります。");
        return;
      }

      sessionStorage.setItem(VISIT_ACCESS_KEY, "1");
      setAccessState("ready");
      setChallenge(null);
      await refresh();
    } catch (error) {
      console.error(error);
      setAuthMessage(error instanceof Error ? error.message : "再認証に失敗しました。");
    } finally {
      setAuthBusy(false);
    }
  }

  if (accessState === "checking") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="k-card p-10 text-center text-sm font-bold text-black/40">確認中…</div>
      </main>
    );
  }

  if (accessState === "locked" || accessState === "challenge") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 border-b border-black/15 pb-8">
          <p className="k-label">Rankings</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-6xl">ランキング</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-black/50">
            ランキングは成績を登録した参加者だけ見られます。再訪時は出席番号と、登録済み科目からランダムに1科目の点数で簡易確認します。
          </p>
        </div>

        <section className="k-card overflow-hidden">
          <div className="border-b border-black/10 bg-black p-6 text-white sm:p-8">
            <div className="flex items-center gap-3">
              <LockKeyhole size={22} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Access check</p>
                <h2 className="mt-1 text-2xl font-black">参加者確認</h2>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <label className="block text-sm font-bold" htmlFor="ranking-seat-number">出席番号</label>
            <input
              id="ranking-seat-number"
              type="number"
              min="401"
              max="440"
              inputMode="numeric"
              value={seatNumber}
              onChange={(event) => {
                setSeatNumber(event.target.value);
                setAuthMessage("");
                if (accessState === "challenge") {
                  setAccessState("locked");
                  setChallenge(null);
                  setChallengeScore("");
                }
              }}
              placeholder="401–440"
              className="k-input mt-2 max-w-xs py-3 font-mono font-bold"
              disabled={authBusy}
            />

            {accessState === "challenge" && challenge && (
              <div className="mt-7 border-t border-black/10 pt-7">
                <p className="text-sm font-bold">確認問題</p>
                <p className="mt-2 text-2xl font-black tracking-[-0.025em]">「{challenge.subjectName}」の点数</p>
                <p className="mt-2 text-xs font-medium text-black/45">登録時に入力した点数をそのまま入力してください。</p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  inputMode="decimal"
                  value={challengeScore}
                  onChange={(event) => {
                    setChallengeScore(event.target.value);
                    setAuthMessage("");
                  }}
                  placeholder="0–100"
                  className="k-input mt-4 max-w-xs py-3 font-mono font-bold"
                  disabled={authBusy}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void verifyChallenge();
                  }}
                />
              </div>
            )}

            {authMessage && (
              <p className="mt-5 border-l-2 border-black pl-3 text-sm font-bold leading-6">{authMessage}</p>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              {accessState === "locked" ? (
                <button type="button" onClick={() => void requestChallenge()} disabled={authBusy} className="k-button gap-2 disabled:opacity-40">
                  {authBusy ? "確認中…" : "確認問題を出す"} <ArrowRight size={17} />
                </button>
              ) : (
                <button type="button" onClick={() => void verifyChallenge()} disabled={authBusy} className="k-button gap-2 disabled:opacity-40">
                  {authBusy ? "確認中…" : "ランキングに入る"} <ArrowRight size={17} />
                </button>
              )}
              <Link href="/submit" className="k-button-secondary">初回の成績入力</Link>
            </div>

            <p className="mt-6 text-xs font-medium leading-5 text-black/40">
              この確認は本人証明ではなく、登録済み参加者だけにランキング閲覧を絞るための簡易認証です。
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-black/15 pb-8">
        <div>
          <p className="k-label">Rankings</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-6xl">ランキング</h1>
          <p className="mt-4 text-sm font-medium text-black/50">GPAと科目ごとの参加者内順位を表示します。</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={state === "loading"} className="k-button-secondary gap-2 px-4 py-2.5 text-sm disabled:opacity-40">
          <RefreshCw size={16} className={state === "loading" ? "animate-spin" : ""} />
          更新
        </button>
      </div>

      {state === "error" && (
        <div className="mb-6 rounded-[6px] border border-black/20 bg-neutral-100 p-4 text-sm font-bold">{message}</div>
      )}

      {state === "loading" && board.length === 0 ? (
        <div className="k-card p-10 text-center text-sm font-bold text-black/40">読み込み中…</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <RankingBoard board={board} />
          <SubjectBoards boards={subjectBoards} />
        </div>
      )}
    </main>
  );
}
