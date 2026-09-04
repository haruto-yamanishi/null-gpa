import type {
  GradeInput,
  GpaRank,
  IdentityMode,
  RankingRow,
  SubjectRankingRow,
  SubjectStatistic,
  Visibility,
} from "@/lib/types";
import { SUBJECTS } from "@/lib/fixtures";
import { getSupabaseBrowserClient } from "./client";

export type SubmissionPayload = {
  identityMode: IdentityMode;
  displayName: string;
  gpaVisibility: Visibility;
  seatNumber: number;
  seatNumberVisibility: Visibility;
  grades: GradeInput[];
};

export type RankingReentryChallenge = {
  subjectId: string;
  subjectName: string;
};

export const RANKING_ACCESS_REQUIRED = "RANKING_ACCESS_REQUIRED";

export async function ensureSession() {
  const supabase = getSupabaseBrowserClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  if (sessionData.session?.user) {
    return { supabase, user: sessionData.session.user };
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error("Anonymous sign-in did not return a user.");

  return { supabase, user: data.user };
}

function isMissingRpcError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const value = error as { code?: string; message?: string };
  return (
    value.code === "PGRST202" ||
    value.code === "42883" ||
    value.message?.toLowerCase().includes("function") === true && value.message?.toLowerCase().includes("not found") === true
  );
}

function normalizeSupabaseError(error: unknown): Error {
  if (error instanceof Error) return error;

  if (error && typeof error === "object") {
    const value = error as { code?: string; message?: string; details?: string; hint?: string };

    if (value.code === "23505") {
      return new Error("この出席番号はすでに登録されています。登録したブラウザから更新してください。");
    }

    if (value.code === "42703" || value.code === "PGRST204") {
      return new Error("出席番号用のDB更新がまだ反映されていません。Supabaseで最新migrationを実行してください。");
    }

    if (value.code === "42501" && value.message?.includes("ranking access verification required")) {
      return new Error(RANKING_ACCESS_REQUIRED);
    }

    const detail = [value.message, value.details, value.hint].filter(Boolean).join(" / ");
    if (detail) return new Error(detail);
  }

  return new Error("保存に失敗しました。");
}

async function grantRankingAccessAfterSubmission() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("grant_ranking_access_after_submission");
  if (error) {
    // Compatibility while the production database is being migrated.
    if (isMissingRpcError(error)) return false;
    throw normalizeSupabaseError(error);
  }
  return Boolean(data);
}

export async function isRankingReentryInstalled() {
  await ensureSession();
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.rpc("has_ranking_access");
  if (!error) return true;
  if (isMissingRpcError(error)) return false;
  throw normalizeSupabaseError(error);
}

export async function beginRankingReentry(seatNumber: number): Promise<RankingReentryChallenge | null> {
  await ensureSession();
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("begin_ranking_reentry", {
    p_seat_number: seatNumber,
  });
  if (error) throw normalizeSupabaseError(error);

  const row = data?.[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  return {
    subjectId: String(row.subject_id),
    subjectName: String(row.subject_name),
  };
}

export async function verifyRankingReentry(seatNumber: number, score: number) {
  await ensureSession();
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("verify_ranking_reentry", {
    p_seat_number: seatNumber,
    p_score: score,
  });
  if (error) throw normalizeSupabaseError(error);
  return Boolean(data);
}

export async function saveSubmission(payload: SubmissionPayload) {
  const { supabase, user } = await ensureSession();
  const displayName = payload.identityMode === "named" ? payload.displayName.trim() : null;

  const { error: profileError } = await supabase.from("profiles").upsert({
    user_id: user.id,
    identity_mode: payload.identityMode,
    display_name: displayName || null,
    gpa_visibility: payload.gpaVisibility,
    seat_number: payload.seatNumber,
    seat_number_visibility: payload.seatNumberVisibility,
    updated_at: new Date().toISOString(),
  });
  if (profileError) throw normalizeSupabaseError(profileError);

  const gradeRows = payload.grades.map((grade) => ({
    user_id: user.id,
    subject_id: grade.subjectId,
    score: grade.score,
    visibility: grade.visibility,
    updated_at: new Date().toISOString(),
  }));

  const { error: gradesError } = await supabase.from("grade_submissions").upsert(gradeRows, {
    onConflict: "user_id,subject_id",
  });
  if (gradesError) throw normalizeSupabaseError(gradesError);

  const { error: refreshError } = await supabase.rpc("refresh_my_gpa");
  if (refreshError) throw normalizeSupabaseError(refreshError);

  await grantRankingAccessAfterSubmission();

  const [board, statistics, subjectBoards] = await Promise.all([
    fetchLeaderboard(),
    fetchSubjectStatistics(payload.grades.filter((grade) => grade.score != null).map((grade) => grade.subjectId)),
    fetchSubjectLeaderboards(SUBJECTS.map((subject) => subject.id)),
  ]);

  return { board, statistics, subjectBoards };
}

export async function loadRankings() {
  await ensureSession();
  const [board, subjectBoards] = await Promise.all([
    fetchLeaderboard(),
    fetchSubjectLeaderboards(SUBJECTS.map((subject) => subject.id)),
  ]);
  return { board, subjectBoards };
}

export async function fetchLeaderboard(): Promise<RankingRow[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("get_gpa_leaderboard");
  if (error) throw normalizeSupabaseError(error);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    rank: Number(row.rank),
    participantCount: Number(row.participant_count),
    topPercent: Number(row.top_percent),
    pseudonym: String(row.pseudonym),
    displayName: row.display_name == null ? null : String(row.display_name),
    seatNumber: row.seat_number == null ? null : Number(row.seat_number),
    gpa: row.gpa == null ? null : Number(row.gpa),
    isMe: Boolean(row.is_me),
  }));
}

export async function fetchMyGpaRank(): Promise<GpaRank | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("get_my_gpa_rank");
  if (error) {
    // Temporary fallback while migration 005 is being applied in production.
    if (isMissingRpcError(error)) {
      try {
        const mine = (await fetchLeaderboard()).find((entry) => entry.isMe);
        return mine ? {
          rank: mine.rank,
          participantCount: mine.participantCount,
          topPercent: mine.topPercent,
        } : null;
      } catch (fallbackError) {
        if (fallbackError instanceof Error && fallbackError.message === RANKING_ACCESS_REQUIRED) return null;
        throw fallbackError;
      }
    }
    throw normalizeSupabaseError(error);
  }

  const row = data?.[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  return {
    rank: Number(row.rank),
    participantCount: Number(row.participant_count),
    topPercent: Number(row.top_percent),
  };
}

export async function fetchSubjectStatistics(subjectIds: string[]) {
  const supabase = getSupabaseBrowserClient();
  const entries = await Promise.all(
    subjectIds.map(async (subjectId) => {
      const { data, error } = await supabase.rpc("get_subject_statistics", {
        p_subject_id: subjectId,
      });
      if (error) throw normalizeSupabaseError(error);

      const row = data?.[0] as Record<string, unknown> | undefined;
      if (!row) return null;

      const statistic: SubjectStatistic = {
        subjectId,
        score: row.score == null ? null : Number(row.score),
        rank: row.rank == null ? null : Number(row.rank),
        participantCount: Number(row.participant_count ?? 0),
        average: row.average == null ? null : Number(row.average),
        median: row.median == null ? null : Number(row.median),
        deviation: row.deviation == null ? null : Number(row.deviation),
      };

      return statistic;
    }),
  );

  return Object.fromEntries(
    entries.filter((entry): entry is SubjectStatistic => entry != null).map((entry) => [entry.subjectId, entry]),
  );
}

export async function fetchSubjectLeaderboards(subjectIds: string[]) {
  const supabase = getSupabaseBrowserClient();
  const entries = await Promise.all(
    subjectIds.map(async (subjectId) => {
      const { data, error } = await supabase.rpc("get_subject_leaderboard", {
        p_subject_id: subjectId,
      });
      if (error) throw normalizeSupabaseError(error);

      const rows: SubjectRankingRow[] = (data ?? []).map((row: Record<string, unknown>) => ({
        subjectId,
        rank: Number(row.rank),
        participantCount: Number(row.participant_count),
        pseudonym: String(row.pseudonym),
        displayName: row.display_name == null ? null : String(row.display_name),
        seatNumber: row.seat_number == null ? null : Number(row.seat_number),
        score: row.score == null ? null : Number(row.score),
        isMe: Boolean(row.is_me),
      }));

      return [subjectId, rows] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<string, SubjectRankingRow[]>;
}
