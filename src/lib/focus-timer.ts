import { useEffect, useSyncExternalStore } from "react";
import { addFocusMinutes, today } from "./store";

export type FocusMode = "work" | "break" | "long";
export interface FocusTimer {
  work: number; brk: number; mode: FocusMode; left: number; run: boolean;
  round: number; endAt: number | null;
  stats: Record<string, { sessions: number; minutes: number }>;
}
export const DEFAULT_TIMER: FocusTimer = { work: 25, brk: 5, mode: "work", left: 1500, run: false, round: 0, endAt: null, stats: {} };
export const timerDuration = (s: FocusTimer, mode = s.mode) => (mode === "work" ? s.work : mode === "long" ? s.brk * 3 : s.brk) * 60;
export const remainingTime = (s: FocusTimer, now = Date.now()) => s.run && s.endAt !== null ? Math.max(0, Math.ceil((s.endAt - now) / 1000)) : s.left;
/** Skip and zero-length sessions never earn study credit. */
export function advanceTimer(s: FocusTimer, completed: boolean, now = Date.now()) {
  const minutes = completed && s.mode === "work" && s.work > 0 ? s.work : 0;
  const round = s.round + (s.mode === "work" ? 1 : 0);
  const mode: FocusMode = s.mode === "work" ? (round % 4 === 0 ? "long" : "break") : "work";
  const day = today(new Date(s.endAt ?? now));
  const stats = minutes ? { ...s.stats, [day]: { sessions: (s.stats[day]?.sessions ?? 0) + 1, minutes: (s.stats[day]?.minutes ?? 0) + minutes } } : s.stats;
  const left = timerDuration(s, mode);
  const run = s.run && left > 0;
  return { timer: { ...s, round, mode, left, run, endAt: run ? now + left * 1000 : null, stats }, minutes, day };
}

let timer = DEFAULT_TIMER;
let owner: string | null = null;
const listeners = new Set<() => void>();
const key = (uid: string) => `bacflow-focus-timer:${uid}`;
function publish(next: FocusTimer, persist = true) {
  timer = next;
  if (persist && owner) try { localStorage.setItem(key(owner), JSON.stringify(timer)); } catch { /* storage unavailable */ }
  listeners.forEach((fn) => fn());
}
function restore(uid: string): FocusTimer {
  try {
    const saved = JSON.parse(localStorage.getItem(key(uid)) || "null") as FocusTimer | null;
    if (saved && [saved.work, saved.brk, saved.left, saved.round].every((n) => Number.isFinite(n) && n >= 0) && ["work", "break", "long"].includes(saved.mode) && typeof saved.run === "boolean" && (!saved.run || Number.isFinite(saved.endAt)) && saved.stats && typeof saved.stats === "object") return saved;
    // Preserve totals recorded by the previous timer on this device.
    return { ...DEFAULT_TIMER, stats: JSON.parse(localStorage.getItem("bacflow-focus-stats") || "{}") };
  } catch { return DEFAULT_TIMER; }
}
function finish(completed: boolean, recovering = false) {
  const result = advanceTimer(timer, completed);
  // Do not invent more completed sessions after the app was closed.
  publish(recovering ? { ...result.timer, run: false, endAt: null } : result.timer);
  if (result.minutes) void addFocusMinutes(result.minutes, result.day);
  if (completed && !recovering) window.dispatchEvent(new CustomEvent("bacflow-timer-finished", { detail: { work: result.minutes > 0 } }));
}
export function useFocusTimer() {
  return useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn); }, () => timer, () => DEFAULT_TIMER);
}
/** Mounted once in the shared app shell, not in the timer page. */
export function useFocusClock(uid: string | null) {
  useEffect(() => {
    owner = uid;
    if (!uid) { publish(DEFAULT_TIMER, false); return; }
    publish(restore(uid));
    if (timer.run && remainingTime(timer) === 0) finish(true, true);
    const tick = () => {
      if (!timer.run) return;
      const left = remainingTime(timer);
      if (left === 0) finish(true);
      else if (left !== timer.left) publish({ ...timer, left }, false);
    };
    const id = window.setInterval(tick, 250);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", tick); };
  }, [uid]);
}
export function toggleTimer() {
  const left = remainingTime(timer);
  const run = !timer.run && left > 0;
  publish({ ...timer, left, run, endAt: run ? Date.now() + left * 1000 : null });
}
export const resetTimer = () => publish({ ...timer, mode: "work", left: timer.work * 60, run: false, endAt: null });
export const skipTimer = () => finish(false);
export const selectTimerMode = (mode: FocusMode) => publish({ ...timer, mode, left: timerDuration(timer, mode), run: false, endAt: null });
export function configureTimer(work: number, brk: number, preset = false) {
  const next = { ...timer, work, brk, mode: preset ? "work" as const : timer.mode, run: false, endAt: null };
  publish({ ...next, left: timerDuration(next) });
}