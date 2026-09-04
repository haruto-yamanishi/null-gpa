import { describe, expect, it } from "vitest";
import { hasRankingAccessCookie } from "@/lib/ranking-access";

describe("ranking access cookie", () => {
  it("finds a valid ranking access cookie among other cookies", () => {
    expect(hasRankingAccessCookie("theme=dark; null-gpa-ranking-access=1; locale=ja")).toBe(true);
  });

  it("rejects missing or invalid ranking access cookies", () => {
    expect(hasRankingAccessCookie("")).toBe(false);
    expect(hasRankingAccessCookie("null-gpa-ranking-access=0")).toBe(false);
    expect(hasRankingAccessCookie("other-null-gpa-ranking-access=1")).toBe(false);
  });
});
