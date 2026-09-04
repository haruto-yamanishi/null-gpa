import { NextResponse } from "next/server";
import { SUBJECTS, SYNTHETIC_PARTICIPANTS } from "@/lib/fixtures";
import { standardCompetitionRank } from "@/lib/stats";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subject = SUBJECTS.find((item) => item.id === id);
  if (!subject) return NextResponse.json({ error: "subject_not_found" }, { status: 404 });

  const rows = SYNTHETIC_PARTICIPANTS
    .flatMap((participant) => {
      const grade = participant.grades[id];
      return grade ? [{ participant, grade }] : [];
    });
  const ranked = standardCompetitionRank(rows, (entry) => entry.grade.score).map((entry) => ({
    rank: entry.rank,
    label: entry.participant.identityMode === "named" && entry.participant.displayName
      ? entry.participant.displayName
      : `ANON-${entry.participant.accountId.slice(-2).toUpperCase()}••`,
    seatNumber: entry.participant.seatNumberVisibility === "public" ? entry.participant.seatNumber : null,
    value: entry.grade.visibility === "public" ? entry.grade.score : null,
    valueVisibility: entry.grade.visibility,
  }));

  return NextResponse.json({ subject, n: ranked.length, classSize: 40, rows: ranked });
}
