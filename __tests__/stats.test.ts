import { describe, expect, it } from "vitest";
import { deviationScore, standardCompetitionRank } from "@/lib/stats";

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
