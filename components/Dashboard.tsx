"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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

const initialScores: Record<string, number | null> = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.id, null]),
);

const initialVisibilities: Record<string, Visibility> = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.id, "public"]),
);

export default function Dashboard() {
  const [identityMode, setIdentityMode] = useState<IdentityMode>("named");
  const [displayName, setDisplayName] = useState("");
  const [gpaVisibility, setGpaVisibility] = useState<Visibility>("public");
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
      visibility: visibilities[subject.id] ?? "public",
    })),
    [scores, visibilities],
  );

  const { gpa, credits } = useMemo(() => calculateGpa(SUBJECTS, grades), [grades]);
  const mine = board.find((entry) => entry.isMe);

  function clearStaleMessage() {
    if (submitState !== "idle" && submitState !== "saving") {
      setSubmitState("idle");
      setMessage("");
    }
  }

  async function submit() {
    if (!backendConfigured) {
      setSubmitState("error");
      setMessage("接続設定が見つかりません。時間をおいて再読み込みしてください。");
      return;
    }

    if (identityMode === "named" && !displayName.trim()) {
      setSubmitState("error");
      setMessage("名前を入力してください。匿名で参加する場合はAnonymousを選べます。");
      return;
    }

    if (gpa == null) {
      setSubmitState("error");
      setMessage("少なくとも1科目の成績を入力してください。");
      return;
    }

    setSubmitState("saving");
    setMessage("保存しています…");

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
      setMessage("保存しました。ランキングに反映されています。");
    } catch (error) {
      console.error(error);
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-black/15 pb-8">
        <div>
          <p className="k-label">Grade entry</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-6xl">成績を登録</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-black/50">
            点数を入力するとGPAを自動計算します。公開設定は名前・GPA・各科目ごとに変更できます。
          </p>
        </div>
        <div className="rounded-full border border-black/20 px-4 py-2 text-xs font-bold text-black/60">
          2026 / 4年
        </div>
      </div>

      <section className="mb-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="k-card p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="GPA" value={gpa == null ? "—" : gpa.toFixed(2)} note={`${credits} credits`} accent />
            <Metric label="参加者内順位" value={mine ? `#${mine.rank} / ${mine.participantCount}` : "—"} note="保存後に表示" />
            <Metric label="上位率" value={mine ? `${mine.topPercent.toFixed(1)}%` : "—"} note="参加者内" />
          </div>
        </div>

        <PrivacyControls
          identityMode={identityMode}
          displayName={displayName}
          gpaVisibility={gpaVisibility}
          onIdentityModeChange={(value) => {
            clearStaleMessage();
            setIdentityMode(value);
          }}
          onDisplayNameChange={(value) => {
            clearStaleMessage();
            setDisplayName(value);
          }}
          onGpaVisibilityChange={(value) => {
            clearStaleMessage();
            setGpaVisibility(value);
          }}
        />
      </section>

      <GradeTable
        scores={scores}
        visibilities={visibilities}
        analytics={subjectStats}
        onScoreChange={(subjectId, score) => {
          clearStaleMessage();
          setScores((current) => ({ ...current, [subjectId]: score }));
        }}
        onVisibilityChange={(subjectId, visibility) => {
          clearStaleMessage();
          setVisibilities((current) => ({ ...current, [subjectId]: visibility }));
        }}
      />

      <section className="mt-7 k-card overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="k-label">Save</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.025em]">ランキングに反映</h2>
            <p className="mt-2 text-sm font-medium text-black/45">保存後も同じブラウザから何度でも更新できます。</p>
          </div>
          <button type="button" onClick={submit} disabled={submitState === "saving"} className="k-button min-w-56 gap-2">
            {submitState === "saving" ? "保存中…" : "保存する"}
            {submitState !== "saving" && <ArrowRight size={18} />}
          </button>
        </div>
        {message && (
          <div className={`border-t border-black/10 px-6 py-4 text-sm font-bold sm:px-8 ${submitState === "error" ? "bg-neutral-100" : "bg-neutral-50"}`} aria-live="polite">
            <span className="inline-flex items-center gap-2">
              {submitState === "saved" && <CheckCircle2 size={17} />}
              {message}
            </span>
            {submitState === "saved" && (
              <Link href="/rankings" className="ml-4 inline-flex items-center gap-1 underline underline-offset-4">
                ランキングを見る <ArrowRight size={14} />
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value, note, accent = false }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border border-black/15 p-5 ${accent ? "bg-black text-white" : "bg-white"}`}>
      <p className={`text-[11px] font-bold uppercase tracking-[0.14em] ${accent ? "text-white/45" : "text-black/40"}`}>{label}</p>
      <p className="mt-2 font-mono text-3xl font-black tracking-tight">{value}</p>
      <p className={`mt-1 text-xs font-bold ${accent ? "text-white/45" : "text-black/40"}`}>{note}</p>
    </div>
  );
}
