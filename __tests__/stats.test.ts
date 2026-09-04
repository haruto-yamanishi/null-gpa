import { describe, expect, it } from "vitest";
import { deviationScore, standardCompetitionRank } from "@/lib/stats";
import { subjectDeviationDisplay } from "@/lib/subject-statistics";
import type { SubjectStatistic } from "@/lib/types";

describe("ranking", () => {
  it("uses standard competition ranking", () => {
    const ranked = standardCompetitionRank(
      [{ v: 3.8 }, { v: 3.65 }, { v: 3.65 }, { v: 3.51 }],
      (item) => item.v,
    );
    expect(ranked.map((item) => item.rank)).toEqual([1, 2, 2, 4]);
  });

  it("calculates deviation score", () => {
    const value = deviationScore(80, [60, 70, 80, 90, 100]);
    expect(value).toBeCloseTo(50, 10);
  });
});

describe("subject deviation display", () => {
  const statistic = (participantCount: number, deviation: number | null): SubjectStatistic => ({
    subjectId: "subject",
    score: 80,
    rank: 1,
    participantCount,
    average: deviation == null ? null : 70,
    median: deviation == null ? null : 70,
    deviation,
  });

  it("asks the participant to register a score when they have no subject statistic", () => {
    expect(subjectDeviationDisplay(undefined)).toEqual({
      value: "—",
      note: "この科目の点数を登録すると表示",
    });
  });

  it("explains that the threshold uses per-subject score registrations", () => {
    expect(subjectDeviationDisplay(statistic(9, null))).toEqual({
      value: "—",
      note: "この科目はあと1人の点数登録で表示",
    });
  });

  it("formats a deviation score once ten subject scores exist", () => {
    expect(subjectDeviationDisplay(statistic(10, 55))).toEqual({
      value: "55.0",
      note: "この科目の10人から計算",
    });
  });
});
