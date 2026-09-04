"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { SUBJECTS } from "@/lib/fixtures";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { IdentityMode, Visibility } from "@/lib/types";

type Profile = {
  pseudonym: string;
  identity_mode: IdentityMode;
  display_name: string | null;
  gpa_visibility: Visibility;
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
  const [gpa, setGpa] = useState<GpaSnapshot | null>(null);
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

        const [profileResult, gradesResult, gpaResult] = await Promise.all([
          supabase.from("profiles").select("pseudonym, identity_mode, display_name, gpa_visibility").maybeSingle(),
          supabase.from("grade_submissions").select("subject_id, score, visibility").order("subject_id"),
          supabase.from("gpa_snapshots").select("gpa, graded_credits").maybeSingle(),
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
        setGpa(gpaResult.data as GpaSnapshot | null);
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
    return <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><div className="k-card p-10 text-center text-sm font-black text-black/45">読み込み中…</div></main>;
  }

  if (state === "empty") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="k-card p-8 sm:p-10">
          <p className="k-label">My page</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">まだ成績が保存されていません</h1>
          <p className="mt-4 text-sm font-medium text-black/55">このブラウザから成績を登録すると、ここで保存内容を確認できます。</p>
          <Link href="/submit" className="k-button mt-7">成績を入力する</Link>
        </div>
      </main>
    );
  }

  if (state === "error" || !profile) {
    return <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><div className="rounded-2xl border-2 border-black bg-[#ff7768]/25 p-5 font-bold">{message || "データを表示できませんでした。"}</div></main>;
  }

  const displayLabel = profile.identity_mode === "named" && profile.display_name ? profile.display_name : profile.pseudonym;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <p className="k-label">My page</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{displayLabel}</h1>
      </div>

      <section className="grid gap-5 sm:grid-cols-3">
        <Metric label="GPA" value={gpa ? Number(gpa.gpa).toFixed(2) : "—"} note={profile.gpa_visibility === "public" ? "Public" : "Private"} accent="bg-[#ffd84d]" />
        <Metric label="表示名" value={profile.identity_mode === "named" ? "Name" : "Anonymous"} note={profile.display_name ?? profile.pseudonym} accent="bg-[#8fe0c0]" />
        <Metric label="入力単位" value={gpa ? String(gpa.graded_credits) : "0"} note="graded credits" accent="bg-[#ff7768]/65" />
      </section>

      <section className="mt-7 k-card overflow-hidden">
        <div className="border-b-2 border-black bg-[#2864ff] p-6 text-white">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/65">Saved grades</p>
          <h2 className="mt-1 text-2xl font-black">保存済みの成績</h2>
        </div>
        <div className="divide-y-2 divide-black">
          {grades.filter((grade) => grade.score != null).map((grade) => {
            const subject = SUBJECTS.find((item) => item.id === grade.subject_id);
            return (
              <div key={grade.subject_id} className="grid grid-cols-[minmax(0,1fr)_80px_90px] items-center gap-3 bg-white px-6 py-4">
                <span className="font-black">{subject?.name ?? grade.subject_id}</span>
                <span className="text-right font-mono font-black">{grade.score == null ? "—" : Number(grade.score).toFixed(0)}</span>
                <span className="flex items-center justify-end gap-1.5 text-xs font-black text-black/50">
                  {grade.visibility === "public" ? <Eye size={14} /> : <EyeOff size={14} />}
                  {grade.visibility === "public" ? "Public" : "Private"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-7 flex justify-end">
        <Link href="/submit" className="k-button">成績・公開設定を更新</Link>
      </div>
    </main>
  );
}

function Metric({ label, value, note, accent }: { label: string; value: string; note: string; accent: string }) {
  return (
    <div className={`k-card p-5 ${accent}`}>
      <p className="k-label">{label}</p>
      <p className="mt-2 break-words text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 truncate text-xs font-bold text-black/50">{note}</p>
    </div>
  );
}
