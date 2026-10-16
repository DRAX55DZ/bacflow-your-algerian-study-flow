import { describe, expect, it } from "vitest";
import { COEFFS, overallPct, SUBJECTS } from "@/lib/syllabus";

const allOf = (id: string) => Object.fromEntries(SUBJECTS.find((s) => s.id === id)!.units.flatMap((u) => u.items).map((i) => [i.id, true]));

describe("weighted Bac progress", () => {
  it("science stream coefficients", () => {
    expect(COEFFS.sci).toMatchObject({ nat: 6, phy: 5, math: 5, ar: 3 });
  });
  it("math stream coefficients", () => {
    expect(COEFFS.math).toMatchObject({ math: 7, phy: 6, nat: 2, ar: 3 });
  });
  it("finishing Math weighs 7/28 in Math stream and 5/29 in Science", () => {
    expect(overallPct("math", allOf("math"))).toBeCloseTo((7 / 28) * 100);
    expect(overallPct("sci", allOf("math"))).toBeCloseTo((5 / 29) * 100);
  });
});
