import { describe, expect, it } from "vitest";
import { doneToday, today } from "@/lib/store";
import { subjectsFor } from "@/lib/syllabus";
import { passed } from "@/components/UnitQuiz";

describe("daily targets reset at midnight", () => {
  it("done today counts, done yesterday does not", () => {
    const now = new Date(2026, 9, 19, 0, 0, 1);
    expect(doneToday(today(new Date(2026, 9, 19, 9)), now)).toBe(true);
    expect(doneToday(today(new Date(2026, 9, 18, 23, 59)), now)).toBe(false);
  });
});

describe("unit quizzes", () => {
  it("every unit has a quiz", () => {
    for (const st of ["sci", "math"] as const)
      for (const s of subjectsFor(st)) for (const u of s.units) expect(u.items.some((i) => i.kind === "quiz")).toBe(true);
  });
  it("pass mark is 4 out of 5", () => {
    expect(passed(4)).toBe(true);
    expect(passed(3)).toBe(false);
  });
});
