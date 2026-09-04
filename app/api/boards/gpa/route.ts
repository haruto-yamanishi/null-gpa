import { NextResponse } from "next/server";
import { SUBJECTS, SYNTHETIC_PARTICIPANTS } from "@/lib/fixtures";
import { gpaBoard } from "@/lib/leaderboard";

export async function GET() {
  const board = gpaBoard(SYNTHETIC_PARTICIPANTS, SUBJECTS).map((entry) => ({
    rank: entry.rank,
    label: entry.participant.identityMode === "named" && entry.participant.displayName
      ? entry.participant.displayName
      : `ANON-${entry.participant.accountId.slice(-2).toUpperCase()}••`,
    seatNumber: entry.participant.seatNumberVisibility === "public" ? entry.participant.seatNumber : null,
    value: entry.participant.gpaVisibility === "public" ? Number(entry.gpa.toFixed(2)) : null,
    valueVisibility: entry.participant.gpaVisibility,
  }));
  return NextResponse.json({ boardScope: "2026-grade4-gpa", n: board.length, classSize: 40, rows: board });
}
