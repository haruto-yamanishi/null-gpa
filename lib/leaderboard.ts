import { calculateGpa } from "./grading";
import { deviationScore, mean, median, standardCompetitionRank, topPercent } from "./stats";
import type { Participant, Subject } from "./types";

export function participantGpa(participant: Participant, subjects: Subject[]) {
  return calculateGpa(
    subjects,
    subjects.map((subject) => ({
      subjectId: subject.id,
      score: participant.grades[subject.id]?.score ?? null,
      visibility: participant.grades[subject.id]?.visibility ?? "private",
    })),
  ).gpa;
}

export function gpaBoard(participants: Participant[], subjects: Subject[]) {
  const eligible = participants
    .map((participant) => ({ participant, gpa: participantGpa(participant, subjects) }))
    .filter((entry): entry is { participant: Participant; gpa: number } => entry.gpa != null);
  return standardCompetitionRank(eligible, (entry) => entry.gpa).map((entry) => ({
    ...entry,
    topPercent: topPercent(entry.rank, eligible.length),
  }));
}

export function subjectAnalytics(subjectId: string, participants: Participant[], myScore: number) {
  const scores = participants
    .map((participant) => participant.grades[subjectId]?.score)
    .filter((score): score is number => typeof score === "number");
  const ranked = standardCompetitionRank(scores.map((score, i) => ({ id: i, score })), (entry) => entry.score);
  const myRank = standardCompetitionRank([...scores.map((score, i) => ({ id: String(i), score })), { id: "me", score: myScore }], (entry) => entry.score)
    .find((entry) => entry.id === "me")?.rank ?? null;
  return {
    n: scores.length + 1,
    rank: myRank,
    average: mean([...scores, myScore]),
    median: median([...scores, myScore]),
    deviation: deviationScore(myScore, [...scores, myScore]),
    topPercent: myRank ? topPercent(myRank, scores.length + 1) : null,
    _ranked: ranked,
  };
}
