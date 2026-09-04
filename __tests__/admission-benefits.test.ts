import { describe, expect, it } from "vitest";
import { getAdmissionBenefits, getNextAdmissionTarget } from "@/lib/admission-benefits";

describe("admission benefits", () => {
  it("includes stricter and broader programs for a top-two rank", () => {
    const programs = getAdmissionBenefits(2).map((benefit) => benefit.program);
    expect(programs).toContain("VOS特待生");
    expect(programs).toContain("工学部 推薦入試");
    expect(programs).toContain("水環境・土木工学科");
  });

  it("filters out programs whose rank threshold is not met", () => {
    const benefits = getAdmissionBenefits(9);
    expect(benefits.every((benefit) => benefit.maxRank >= 9)).toBe(true);
    expect(benefits.some((benefit) => benefit.maxRank === 2)).toBe(false);
  });

  it("finds the closest stricter target", () => {
    expect(getNextAdmissionTarget(13)?.maxRank).toBe(12);
    expect(getNextAdmissionTarget(21)?.maxRank).toBe(20);
  });
});
