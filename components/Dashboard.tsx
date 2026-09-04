"use client";

import { useMemo, useState } from "react";
import { Database, LockKeyhole, UserRound } from "lucide-react";
import { SUBJECTS } from "@/lib/fixtures";
import { calculateGpa } from "@/lib/grading";
import { saveSubmission } from "@/lib/supabase/submission";
import type {
  GradeInput,
  IdentityMode,
  RankingRow,
  SubjectStatistic,
  Visibility,
} from "@/lib/types";
import { GradeTable } from "./GradeTable";
import { PrivacyControls } from "./PrivacyControls";
import { RankingBoard } from "./RankingBoard";

const initialScores: Record<string, number | null> = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.id, null]),
);

const initialVisibilities: Record<string, Visibility> = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.id, "private"]),
);

export default function Dashboard() {
  const [identityMode, setIdentityMode] = useState<IdentityMode>("anonymous");
  const [displayName, setDisplayName] = useState("");
  const [gpaVisibility, setGpaVisibility] = useState<Visibility>("private");
  const [scores, setScores] = useState(initialScores);
  const [visibilities, setVisibilities] = useState(initialVisibilities);
  const [board, setBoard] = useState<RankingRow[]>([]);
  const [subjectStats, setSubjectStats] = useState<Record<string, SubjectStatistic>>({});
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const backendConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  const grades = useMemo<GradeInput[]>(
    () => SUBJECTS.map((subject) => ({
      subjectId: subject.id,
      score: scores[subject.id] ?? null,
      visibility: visibilities[subject.id] ?? "private",
    })),
    [scores, visibilities],
  );

  const { gpa, credits } = useMemo(() => calculateGpa(SUBJECTS, grades), [grades]);
  const mine = board.find((entry) => entry.isMe);

  async function submit() {
    if (!backendConfigured) {
      setSubmitState("error");
      setMessage("Supabase環境変数が未設定です。");
      return;
    }

    if (identityMode === "named" && !displayName.trim()) {
      setSubmitState("error");
      setMessage("Namedを選ぶ場合は表示名を入力してください。");
      return;
    }

    if (gpa == null) {
      setSubmitState("error");
      setMessage("少なくとも1科目の成績を入力してください。");
      return;
    }

    setSubmitState("saving");
    setMessage("匿名セッションを作成して保存しています…");

    try {
      const result = await saveSubmission({
        identityMode,
        displayName,
        gpaVisibility,
        grades,
      });
      setBoard(result.board);
      setSubjectStats(result.statistics);
      setSubmitState("saved");
      setMessage("保存しました。ランキングと科目統計を更新しました。");
    } catch (error) {
      console.error(error);
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="mb-8 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-bold tracking-[.2em] text-lime-200">2026 / GRADE 4 / SELF-REPORTED</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">成績は入力する。<br />公開するかは自分で決める。</h1>
            </div>
            <div className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${backendConfigured ? "border-lime-200/20 bg-lime-200/10 text-lime-100" : "border-amber-300/20 bg-amber-300/10 text-amber-100"}`}>
              {backendConfigured ? <Database size={14} /> : <LockKeyhole size={14} />}
              {backendConfigured ? "SUPABASE READY" : "LOCAL ONLY"}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric label="GPA" value={gpa == null ? "—" : gpa.toFixed(2)} note={`${credits} graded credits`} accent />
            <Metric label="参加者内順位" value={mine ? `#${mine.rank} / ${mine.participantCount}` : "—"} note="保存後に表示" />
            <Metric label="上位率" value={mine ? `${mine.topPercent.toFixed(1)}%` : "—"} note="参加者内" />
          </div>
        </div>

        <PrivacyControls
          identityMode={identityMode}
          displayName={displayName}
          gpaVisibility={gpaVisibility}
          onIdentityModeChange={setIdentityMode}
          onDisplayNameChange={setDisplayName}
          onGpaVisibilityChange={setGpaVisibility}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <GradeTable
          scores={scores}
          visibilities={visibilities}
          analytics={subjectStats}
          onScoreChange={(subjectId, score) => setScores((current) => ({ ...current, [subjectId]: score }))}
          onVisibilityChange={(subjectId, visibility) => setVisibilities((current) => ({ ...current, [subjectId]: visibility }))}
        />

        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-xs font-bold tracking-[.14em] text-zinc-500">SUBMIT</p>
            <h2 className="mt-1 text-xl font-black">ランキングに参加</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              初回はSupabase Anonymous Authで端末用アカウントを作成します。学校公式順位ではなく、参加者内順位です。
            </p>
            <button
              type="button"
              onClick={submit}
              disabled={submitState === "saving"}
              className="mt-4 min-h-12 w-full rounded-xl bg-lime-200 px-4 py-3 font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitState === "saving" ? "保存中…" : "ランキングに参加 / 更新"}
            </button>
            {message && (
              <p className={`mt-3 text-sm ${submitState === "error" ? "text-rose-300" : "text-zinc-400"}`} aria-live="polite">
                {message}
              </p>
            )}
          </section>

          <RankingBoard board={board} />

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 text-zinc-400" />
              <div>
                <p className="font-bold">今日公開するMVPの境界</p>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  他ユーザーはRLSによりあなたの生点数を直接取得できません。一方、無料構成ではSupabaseプロジェクト管理者はtrust boundary内です。製作者にも絶対に見えない、とは表示しません。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, note, accent = false }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-bold tracking-[.14em] text-zinc-500">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-black ${accent ? "text-lime-200" : ""}`}>{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{note}</p>
    </div>
  );
}
