import type { GradeInput, Subject } from "./types";

export const GRADING_POLICY_VERSION = "2026-v1";

export type LetterGrade = "S" | "A" | "B" | "C" | "F";

export function gradePoint(score: number): number {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new RangeError("score must be between 0 and 100");
  }
  if (score >= 90) return 4;
  if (score >= 80) return 3;
  if (score >= 70) return 2;
  if (score >= 60) return 1;
  return 0;
}

export function letterGrade(score: number): LetterGrade {
  const point = gradePoint(score);
  return (["F", "C", "B", "A", "S"] as const)[point];
}

export function calculateGpa(subjects: Subject[], grades: GradeInput[]) {
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  let weighted = 0;
  let credits = 0;

  for (const grade of grades) {
    if (grade.score == null) continue;
    const subject = subjectById.get(grade.subjectId);
    if (!subject) throw new Error(`unknown subject: ${grade.subjectId}`);
    weighted += gradePoint(grade.score) * subject.credits;
    credits += subject.credits;
  }

  return {
    gpa: credits === 0 ? null : weighted / credits,
    credits,
  };
}
