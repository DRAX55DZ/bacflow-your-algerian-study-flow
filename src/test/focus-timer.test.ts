import { describe, expect, it } from "vitest";
import { advanceTimer, DEFAULT_TIMER, remainingTime } from "@/lib/focus-timer";
import { bestStreak, streak, today } from "@/lib/store";

describe("saved focus timer", () => {
  it("running countdown survives serialization and keeps advancing while away", () => {
    const saved = JSON.parse(JSON.stringify({ ...DEFAULT_TIMER, run: true, endAt: 1000 + 1500 * 1000 }));
    expect(remainingTime(saved, 61000)).toBe(1440);
    expect(remainingTime(saved, 1501000)).toBe(0);
  });
  it("paused time, settings and totals survive serialization", () => {
    const timer = { ...DEFAULT_TIMER, work: 50, brk: 10, left: 87, round: 2, stats: { "2026-11-07": { sessions: 2, minutes: 100 } } };
    const saved = JSON.parse(JSON.stringify(timer));
    expect(remainingTime(saved, 999999)).toBe(87);
    expect(saved.work).toBe(50);
    expect(saved.brk).toBe(10);
    expect(saved.stats["2026-11-07"]).toEqual({ sessions: 2, minutes: 100 });
  });
  it("a completed focus session records one session and its full duration", () => {
    const result = advanceTimer({ ...DEFAULT_TIMER, run: true, endAt: new Date(2026, 10, 7, 9).getTime() }, true);
    expect(result.minutes).toBe(25);
    expect(result.timer.stats["2026-11-07"]).toEqual({ sessions: 1, minutes: 25 });
    expect(result.timer.mode).toBe("break");
  });
  it("skips, breaks and zero duration do not count as completed study", () => {
    expect(advanceTimer(DEFAULT_TIMER, false).minutes).toBe(0);
    expect(advanceTimer({ ...DEFAULT_TIMER, mode: "break" }, true).minutes).toBe(0);
    expect(advanceTimer({ ...DEFAULT_TIMER, work: 0 }, true).minutes).toBe(0);
  });
  it("a focus-only completed session counts toward the streak and best streak", () => {
    const day = today();
    expect(streak({}, {}, { [day]: 25 })).toBe(1);
    expect(bestStreak({}, {}, { [day]: 25 })).toBe(1);
    expect(streak({}, {}, { [day]: 0 })).toBe(0);
  });
});