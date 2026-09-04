import { describe, expect, it } from "vitest";
import { SUBJECTS } from "@/lib/fixtures";
import { calculateGpa, gradePoint } from "@/lib/grading";

const grades = [93, 89, 89, 83, 83, 81, 92, 92, 76, 87];

describe("grading", () => {
  it("maps scores to grade points", () => {
    expect(gradePoint(90)).toBe(4);
    expect(gradePoint(89.99)).toBe(3);
    expect(gradePoint(70)).toBe(2);
    expect(gradePoint(60)).toBe(1);
    expect(gradePoint(59.99)).toBe(0);
  });

  it("calculates weighted GPA", () => {
    const result = calculateGpa(
      SUBJECTS,
      SUBJECTS.map((subject, index) => ({ subjectId: subject.id, score: grades[index], visibility: "private" as const })),
    );
    expect(result.credits).toBe(24);
    expect(result.gpa).toBeCloseTo(3.25, 10);
  });
});
