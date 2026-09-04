"use client";

import { useMemo, useState } from "react";
import { LockKeyhole, UserRound } from "lucide-react";
import { SUBJECTS, SYNTHETIC_PARTICIPANTS } from "@/lib/fixtures";
import { calculateGpa } from "@/lib/grading";
import { gpaBoard } from "@/lib/leaderboard";
import type { GradeInput, IdentityMode, Participant, Visibility } from "@/lib/types";
import { GradeTable } from "./GradeTable";
import { PrivacyControls } from "./PrivacyControls";
import { RankingBoard } from "./RankingBoard";

const accountId = "local-demo-user";

const initialScores: Record<string, number | null> = {
  "english-4": 93,
  psychology: 89,
  "analysis-1": 89,
  "discrete-math": 83,
  "cognitive-science": 83,
  "pe-4": 81,
  "web-programming-2": 92,
  "computer-architecture": 92,
  neighborhood: 76,
  "design-engineering": 87,
};

export default function Dashboard() {
  const [identityMode, setIdentityMode] = useState<IdentityMode>("anonymous");
  const [displayName, setDisplayName] = useState("Haruto");
  const [gpaVisibility, setGpaVisibility] = useState<Visibility>("private");
  const [scores, setScores] = useState(initialScores);
  const [visibilities, setVisibilities] = useState<Record<string, Visibility>>(
    Object.fromEntries(SUBJECTS.map((subject) => [subject.id, "private"])),
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

  const me = useMemo<Participant>(() => ({
    accountId,
    displayName: identityMode === "named" ? displayName || "Unnamed" : null,
    identityMode,
    gpaVisibility,
    grades: Object.fromEntries(
      SUBJECTS.flatMap((subject) => {
        const score = scores[subject.id];
        return score == null ? [] : [[subject.id, { score, visibility: visibilities[subject.id] ?? "private" }]];
      }),
    ),
  }), [displayName, gpaVisibility, identityMode, scores, visibilities]);

  const board = useMemo(() => gpaBoard([...SYNTHETIC_PARTICIPANTS, me], SUBJECTS), [me]);
  const mine = board.find((entry) => entry.participant.accountId === accountId);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="mb-8 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-bold tracking-[.2em] text-lime-200">2026 / GRADE 4 / SELF-REPORTED</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">成績は入力する。<br />公開するかは自分で決める。</h1>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-100">
              <LockKeyhole size={14} /> LOCAL DEMO
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric label="GPA" value={gpa == null ? "—" : gpa.toFixed(2)} note={`${credits} graded credits`} accent />
            <Metric label="参加者内順位" value={mine ? `#${mine.rank} / ${board.length}` : "—"} note="任意参加者内" />
            <Metric label="上位率" value={mine?.topPercent ? `${mine.topPercent.toFixed(1)}%` : "—"} note="参加者内" />
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
          onScoreChange={(subjectId, score) => setScores((current) => ({ ...current, [subjectId]: score }))}
          onVisibilityChange={(subjectId, visibility) => setVisibilities((current) => ({ ...current, [subjectId]: visibility }))}
        />

        <div className="space-y-6">
          <RankingBoard board={board} accountId={accountId} identityMode={identityMode} displayName={displayName} />
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 text-zinc-400" />
              <div>
                <p className="font-bold">公開と保存は別</p>
                <p className="mt-1 text-sm leading-6 text-zinc-500">Publicを選んだ値も、production要件ではDBへ平文保存しません。現在は保存を行わないローカルMVPです。</p>
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
