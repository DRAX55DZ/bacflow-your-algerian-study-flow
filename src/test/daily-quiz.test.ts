import { describe, expect, it } from "vitest";
import { bestStreak, doneToday, streak, today } from "@/lib/store";
import { subjectsFor } from "@/lib/syllabus";

describe("daily targets reset at midnight", () => {
  it("done today counts, done yesterday does not", () => {
    const now = new Date(2026, 9, 19, 0, 0, 1);
    expect(doneToday(today(new Date(2026, 9, 19, 9)), now)).toBe(true);
    expect(doneToday(today(new Date(2026, 9, 18, 23, 59)), now)).toBe(false);
  });
});

describe("unit quizzes", () => {
  it("every unit has an official test item", () => {
    for (const st of ["sci", "math"] as const)
      for (const s of subjectsFor(st)) for (const u of s.units) expect(u.items.some((i) => i.kind === "quiz")).toBe(true);
  });
});

import { targetXp } from "@/lib/store";
describe("target rewards", () => {
  it("20 XP per target, +50 when all done", () => {
    expect(targetXp([{ done: true }, { done: false }])).toBe(20);
    expect(targetXp([{ done: true }, { done: true }])).toBe(90);
  });
});

describe("streak counts finished-goal days", () => {
  const d = (n: number) => today(new Date(Date.now() - n * 864e5));
  it("a day where only the goals were finished keeps the streak", () => {
    expect(streak({}, { [d(0)]: true })).toBe(1);
    expect(streak({}, { [d(0)]: true, [d(1)]: true })).toBe(2);
  });
  it("a day with no ticks and no finished goals breaks the streak", () => {
    expect(streak({ [d(2)]: 3 }, {})).toBe(0);
  });
  it("best streak counts goal-only days", () => {
    expect(bestStreak({ [d(2)]: 1 }, { [d(1)]: true })).toBe(2);
  });
});
