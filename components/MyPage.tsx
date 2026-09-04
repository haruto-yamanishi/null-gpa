"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Crown, Eye, EyeOff, Medal, Sparkles } from "lucide-react";
import { SUBJECTS } from "@/lib/fixtures";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchMyGpaRank, fetchSubjectStatistics } from "@/lib/supabase/submission";
import { subjectDeviationDisplay } from "@/lib/subject-statistics";
import type { GpaRank, IdentityMode, SubjectStatistic, Visibility } from "@/lib/types";
import { AdmissionBenefits } from "./AdmissionBenefits";
import { getPodiumTheme, RankDisplay } from "./RankDisplay";

type Profile = {
  pseudonym: string;
  identity_mode: IdentityMode;
  display_name: string | null;
  gpa_visibility: Visibility;
  seat_number: number;
  seat_number_visibility: Visibility;
};

type SavedGrade = {
  subject_id: string;
  score: number | null;
  visibility: Visibility;
};

type GpaSnapshot = {
  gpa: number;
  graded_credits: number;
};

export function MyPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [grades, setGrades] = useState<SavedGrade[]>([]);
  const [subjectStatistics, setSubjectStatistics] = useState<Record<string, SubjectStatistic>>({});
  const [gpa, setGpa] = useState<GpaSnapshot | null>(null);
  const [gpaRank, setGpaRank] = useState<GpaRank | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData.session?.user) {
          setState("empty");
          return;
        }

        const [profileResult, gradesResult, gpaResult, statisticsResult, gpaRankResult] = await Promise.all([
          supabase.from("profiles").select("pseudonym, identity_mode, display_name, gpa_visibility, seat_number, seat_number_visibility").maybeSingle(),
          supabase.from("grade_submissions").select("subject_id, score, visibility").order("subject_id"),
          supabase.from("gpa_snapshots").select("gpa, graded_credits").maybeSingle(),
          fetchSubjectStatistics(SUBJECTS.map((subject) => subject.id)),
          fetchMyGpaRank(),
        ]);

        if (profileResult.error) throw profileResult.error;
        if (gradesResult.error) throw gradesResult.error;
        if (gpaResult.error) throw gpaResult.error;
        if (!profileResult.data) {
          setState("empty");
          return;
        }

        setProfile(profileResult.data as Profile);
        setGrades((gradesResult.data ?? []) as SavedGrade[]);
        setSubjectStatistics(statisticsResult);
        setGpa(gpaResult.data as GpaSnapshot | null);
        setGpaRank(gpaRankResult);
        setState("ready");
      } catch (error) {
        console.error(error);
        setMessage(error instanceof Error ? error.message : "データの取得に失敗しました。");
        setState("error");
      }
    }

    void load();
  }, []);

  if (state === "loading") {
    return <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><div className="k-card p-10 text-center text-sm font-bold text-black/40">読み込み中…</div></main>;
  }

  if (state === "empty") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="border-b border-black/15 pb-10">
          <p className="k-label">My page</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-6xl">まだ成績が保存されていません</h1>
          <p className="mt-5 text-sm font-medium text-black/50">このブラウザから成績を登録すると、ここで保存内容を確認できます。</p>
          <Link href="/submit" className="k-button mt-7">成績を入力する</Link>
        </div>
      </main>
    );
  }

  if (state === "error" || !profile) {
    return <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><div className="rounded-[6px] border border-black/20 bg-neutral-100 p-5 font-bold">{message || "データを表示できませんでした。"}</div></main>;
  }

  const displayLabel = profile.identity_mode === "named" && profile.display_name ? profile.display_name : profile.pseudonym;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 border-b border-black/15 pb-8">
        <p className="k-label">My page</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-6xl">{displayLabel}</h1>
      </div>

      {gpaRank && <OverallRank rank={gpaRank.rank} total={gpaRank.participantCount} />}

      <section className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${gpaRank ? "mt-4" : ""}`}>
        <Metric label="GPA" value={gpa ? Number(gpa.gpa).toFixed(2) : "—"} note={profile.gpa_visibility === "public" ? "Public" : "Private"} dark />
        <Metric label="出席番号" value={String(profile.seat_number)} note={profile.seat_number_visibility === "public" ? "Public" : "Private"} />
        <Metric label="表示名" value={profile.identity_mode === "named" ? "Name" : "Anonymous"} note={profile.display_name ?? profile.pseudonym} />
        <Metric label="入力単位" value={gpa ? String(gpa.graded_credits) : "0"} note="単位" />
      </section>

      <section className="mt-7 k-card overflow-hidden">
        <div className="border-b border-black/10 bg-black p-6 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Saved grades</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.025em]">保存済みの成績</h2>
        </div>
        <div className="divide-y divide-black/10">
          {grades.filter((grade) => grade.score != null).map((grade) => {
            const subject = SUBJECTS.find((item) => item.id === grade.subject_id);
            const statistic = subjectStatistics[grade.subject_id];
            const deviation = subjectDeviationDisplay(statistic);
            const podium = statistic?.rank ? getPodiumTheme(statistic.rank) : null;
            return (
              <div key={grade.subject_id} className={`flex flex-wrap items-center gap-x-5 gap-y-2 px-6 py-4 ${podium?.row ?? "bg-white"}`}>
                <span className="min-w-0 basis-full font-bold sm:flex-1 sm:basis-auto">{subject?.name ?? grade.subject_id}</span>
                <div className="flex min-w-[190px] items-baseline justify-between gap-5 sm:w-[230px]">
                  <span className="font-mono text-lg font-black">{grade.score == null ? "—" : `${Number(grade.score).toFixed(0)}点`}</span>
                  {statistic?.rank
                    ? <RankDisplay rank={statistic.rank} total={statistic.participantCount} />
                    : <span className="font-mono text-xs font-bold text-black/50">—</span>}
                </div>
                <span className="min-w-[150px] text-right font-mono text-xs font-bold text-black/50" title={deviation.note}>
                  偏差値 {deviation.value}
                </span>
                <span className="flex items-center justify-end gap-1.5 text-xs font-bold text-black/45">
                  {grade.visibility === "public" ? <Eye size={14} /> : <EyeOff size={14} />}
                  {grade.visibility === "public" ? "Public" : "Private"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {gpaRank && <AdmissionBenefits rank={gpaRank.rank} />}

      <div className="mt-7 flex justify-end">
        <Link href="/submit" className="k-button">成績・公開設定を更新</Link>
      </div>
    </main>
  );
}

function OverallRank({ rank, total }: { rank: number; total: number }) {
  const podium = getPodiumTheme(rank);
  const Icon = rank === 1 ? Crown : Medal;

  if (!podium) {
    return (
      <section className="flex items-center justify-between gap-5 rounded-[8px] border border-black/15 bg-white p-5 sm:px-7">
        <div>
          <p className="k-label">Overall rank</p>
          <p className="mt-1 text-sm font-bold text-black/45">GPA総合順位</p>
        </div>
        <p className="font-mono text-3xl font-black">#{rank} <span className="text-base text-black/35">/ {total}</span></p>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden rounded-[8px] border border-black/20 p-6 sm:p-8 ${podium.row}`}>
      <Sparkles className="absolute right-5 top-5 opacity-20" size={44} aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className={`grid size-14 place-items-center rounded-full border ${podium.badge}`}>
            <Icon size={27} strokeWidth={2.3} aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/45">Top three</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.035em]">トップ3、おめでとう。</h2>
          </div>
        </div>
        <p className="font-mono text-5xl font-black tracking-[-0.06em]">#{rank}<span className="ml-2 text-lg text-black/40">/ {total}</span></p>
      </div>
    </section>
  );
}

function Metric({ label, value, note, dark = false }: { label: string; value: string; note: string; dark?: boolean }) {
  return (
    <div className={`rounded-[6px] border border-black/15 p-5 ${dark ? "bg-black text-white" : "bg-white"}`}>
      <p className={`text-[11px] font-bold uppercase tracking-[0.14em] ${dark ? "text-white/45" : "text-black/40"}`}>{label}</p>
      <p className="mt-2 break-words text-2xl font-black tracking-tight">{value}</p>
      <p className={`mt-1 truncate text-xs font-medium ${dark ? "text-white/45" : "text-black/40"}`}>{note}</p>
    </div>
  );
}
