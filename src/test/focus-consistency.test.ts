import { expect, it } from "vitest";
import { dayScore } from "@/lib/store";
it("25 focused minutes add one consistency level", () => { expect(dayScore(0, 24)).toBe(0); expect(dayScore(0, 50)).toBe(2); expect(dayScore(3, 25)).toBe(4); });
