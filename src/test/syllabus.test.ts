import { describe, expect, it } from "vitest";
import { BAC_YEARS, COEFFS, allItems, overallPct, subjectsFor, type Stream } from "@/lib/syllabus";

const allOf = (st: Stream, id: string) => Object.fromEntries(allItems(subjectsFor(st).find((s) => s.id === id)!).map((i) => [i.id, true]));

describe("weighted Bac progress", () => {
  it("science stream coefficients", () => {
    expect(COEFFS.sci).toMatchObject({ nat: 6, phy: 5, math: 5, ar: 3 });
  });
  it("math stream coefficients", () => {
    expect(COEFFS.math).toMatchObject({ math: 7, phy: 6, nat: 2, ar: 3 });
  });
  it("finishing Math weighs 7/28 in Math stream and 5/29 in Science", () => {
    expect(overallPct("math", allOf("math", "math"))).toBeCloseTo((7 / 28) * 100);
    expect(overallPct("sci", allOf("sci", "math"))).toBeCloseTo((5 / 29) * 100);
  });
});

describe("syllabus content", () => {
  it("past papers cover 2008 to 2026", () => {
    expect(BAC_YEARS.length).toBe(19);
    expect(Math.min(...BAC_YEARS)).toBe(2008);
    expect(Math.max(...BAC_YEARS)).toBe(2026);
  });
  it("math has 6 units in Sciences and 8 in Mathematics stream", () => {
    expect(subjectsFor("sci").find((s) => s.id === "math")!.units.length).toBe(6);
    expect(subjectsFor("math").find((s) => s.id === "math")!.units.length).toBe(8);
  });
  it("natural sciences has 6 units, physics 5", () => {
    expect(subjectsFor("sci").find((s) => s.id === "nat")!.units.length).toBe(6);
    expect(subjectsFor("sci").find((s) => s.id === "phy")!.units.length).toBe(5);
  });
});
