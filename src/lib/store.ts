import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { itemLabel, type Stream } from "./syllabus";
import { normalizeTheme, type ThemeId } from "./themes";
export type Lang = "en" | "ar";

export interface Note { id: string; type: "formula" | "mistake" | "definition"; text: string; at: number }
export interface Target { id: string; text: string; done: boolean }
export interface State {
  userId: string | null; ready: boolean; onboarded: boolean; inviteCode: string;
  name: string; stream: Stream; theme: ThemeId; lang: Lang;
  done: Record<string, boolean>;
  activity: Record<string, number>; // yyyy-mm-dd -> items done
  allDone: Record<string, boolean>; // yyyy-mm-dd -> every daily target finished
  notes: Note[];
  targets: Target[];
}

/** Local calendar day (yyyy-mm-dd), so "today" flips at the student's own midnight. */
export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/** A daily target only counts as done on the day it was ticked. */
export const doneToday = (doneOn: string | null | undefined, now = new Date()) => doneOn === today(now);

const DEFAULT: State = {
  userId: null, ready: false, onboarded: false, inviteCode: "",
  name: "", stream: "sci", theme: "cyber", lang: "en", done: {}, activity: {}, allDone: {}, notes: [], targets: [],
};

let state: State = DEFAULT;
const subs = new Set<() => void>();
function set(fn: (s: State) => State) { state = fn(state); subs.forEach((f) => f()); }

export function useAppState() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => DEFAULT);
}
export const getState = () => state;

const warn = (r: { error: unknown }) => { if (r.error) console.error(r.error); };

const SNAP = "bacflow-snapshot";
const QUEUE = "bacflow-pending";
type Pending = { id: string; done: boolean; day: string; count: number };
const readQueue = (): Pending[] => { try { return JSON.parse(localStorage.getItem(QUEUE) || "[]"); } catch { return []; } };
const writeQueue = (q: Pending[]) => localStorage.setItem(QUEUE, JSON.stringify(q));
function saveSnap() { if (state.userId) try { localStorage.setItem(SNAP, JSON.stringify(state)); } catch { /* full */ } }
subs.add(saveSnap);

export async function loadUser(userId: string | null) {
  if (!userId) { set(() => ({ ...DEFAULT, ready: true })); return; }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    try { const snap = JSON.parse(localStorage.getItem(SNAP) || "null") as State | null; if (snap?.userId === userId) { set(() => ({ ...snap, ready: true })); return; } } catch { /* ignore */ }
  }
  await flushPending(userId);
  const [p, pr, a, n, t] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("progress").select("item_id").eq("user_id", userId),
    supabase.from("activity").select("day,count,all_done").eq("user_id", userId),
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
    supabase.from("targets").select("*").order("created_at"),
  ]);
  const prof = p.data;
  set(() => ({
    userId, ready: true,
    onboarded: !!prof?.onboarded, inviteCode: prof?.invite_code ?? "",
    name: prof?.name ?? "", stream: (prof?.stream as Stream) ?? "sci", theme: normalizeTheme(prof?.theme), lang: prof?.lang === "ar" ? "ar" : "en",
    done: Object.fromEntries((pr.data ?? []).map((r) => [r.item_id, true])),
    activity: Object.fromEntries((a.data ?? []).map((r) => [r.day, r.count])),
    allDone: Object.fromEntries((a.data ?? []).filter((r) => r.all_done).map((r) => [r.day, true])),
    notes: (n.data ?? []).map((r) => ({ id: r.id, type: r.type as Note["type"], text: r.text, at: +new Date(r.created_at) })),
    targets: (t.data ?? []).map((r) => ({ id: r.id, text: r.text, done: doneToday(r.done_on) })),
  }));
}

export async function updateProfile(patch: Partial<Pick<State, "name" | "stream" | "theme" | "lang" | "onboarded">>) {
  set((s) => ({ ...s, ...patch }));
  if (state.userId) warn(await supabase.from("profiles").update(patch).eq("id", state.userId));
}

export function toggleItem(id: string) {
  const uid = state.userId; if (!uid) return false;
  const completed = !state.done[id];
  const d = today();
  const count = (state.activity[d] ?? 0) + (completed ? 1 : 0);
  set((s) => ({ ...s, done: { ...s.done, [id]: completed }, activity: completed ? { ...s.activity, [d]: count } : s.activity }));
  if (!navigator.onLine) { writeQueue([...readQueue().filter((p) => p.id !== id), { id, done: completed, day: d, count }]); return completed; }
  void (async () => {
    if (completed) {
      warn(await supabase.from("progress").insert({ user_id: uid, item_id: id }));
      warn(await supabase.from("activity").upsert({ user_id: uid, day: d, count }));
      warn(await supabase.from("profiles").update({ last_activity: `Completed ${itemLabel(id)}` }).eq("id", uid));
    } else warn(await supabase.from("progress").delete().eq("user_id", uid).eq("item_id", id));
  })();
  return completed;
}

export async function addNote(type: Note["type"], text: string) {
  const { data, error } = await supabase.from("notes").insert({ type, text }).select().single();
  if (error || !data) return console.error(error);
  set((s) => ({ ...s, notes: [{ id: data.id, type, text, at: Date.now() }, ...s.notes] }));
}
export async function deleteNote(id: string) {
  set((s) => ({ ...s, notes: s.notes.filter((x) => x.id !== id) }));
  warn(await supabase.from("notes").delete().eq("id", id));
}
export async function addTarget(text: string) {
  const { data, error } = await supabase.from("targets").insert({ text }).select().single();
  if (error || !data) return console.error(error);
  set((s) => ({ ...s, targets: [...s.targets, { id: data.id, text, done: false }] }));
}
export async function toggleTarget(id: string) {
  const t = state.targets.find((x) => x.id === id); if (!t) return;
  set((s) => ({ ...s, targets: s.targets.map((y) => (y.id === id ? { ...y, done: !y.done } : y)) }));
  warn(await supabase.from("targets").update({ done: !t.done, done_on: t.done ? null : today() }).eq("id", id));
  if (!t.done && state.targets.length > 0 && state.targets.every((x) => x.done)) await markGoalsDay();
}

/** Finishing every daily target earns the day for your streak, even with no syllabus ticks. */
export async function markGoalsDay() {
  const uid = state.userId; if (!uid) return;
  const d = today();
  if (state.allDone[d]) return;
  set((s) => ({ ...s, allDone: { ...s.allDone, [d]: true } }));
  warn(await supabase.from("activity").upsert({ user_id: uid, day: d, all_done: true }));
}

export async function deleteTarget(id: string) {
  set((s) => ({ ...s, targets: s.targets.filter((x) => x.id !== id) }));
  warn(await supabase.from("targets").delete().eq("id", id));
}
export const TARGET_XP = 20, ALL_DONE_BONUS = 50;
/** XP earned today from daily targets: 20 each, +50 when every target is done. */
export const targetXp = (ts: { done: boolean }[]) => {
  const d = ts.filter((x) => x.done).length;
  return d * TARGET_XP + (ts.length > 0 && d === ts.length ? ALL_DONE_BONUS : 0);
};

/** Untick every daily target once the clock passes midnight while the app is open. */
if (typeof window !== "undefined") {
  let day = today();
  setInterval(() => {
    const d = today(); if (d === day) return; day = d;
    set((s) => ({ ...s, targets: s.targets.map((x) => ({ ...x, done: false })) }));
  }, 30_000);
}

/** A day counts if any syllabus item was ticked, or every daily target was finished. */
export const studiedOn = (activity: Record<string, number>, goalsDone: Record<string, boolean>, day: string) =>
  (activity[day] ?? 0) > 0 || !!goalsDone[day];

/** Streak savers: up to this many missed days per week (weeks start Sunday) don't break the streak. */
export const SAVERS_PER_WEEK = 2;
const weekKey = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - x.getDay()); return today(x); };

/** Walk the streak back from today; missed days are covered by savers (they don't add to the count). */
function streakInfo(activity: Record<string, number>, goalsDone: Record<string, boolean>, now = new Date()) {
  const d = new Date(now);
  const saved: string[] = [];
  if (!studiedOn(activity, goalsDone, today(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  const used: Record<string, number> = {};
  for (let guard = 0; guard < 4000; guard++) {
    if (studiedOn(activity, goalsDone, today(d))) { n++; d.setDate(d.getDate() - 1); continue; }
    if (n === 0) break;
    // Gap: bridge it only if every missed day fits that week's savers and a study day lies beyond.
    const probe = new Date(d); const gap: Date[] = []; const tmp = { ...used };
    while (!studiedOn(activity, goalsDone, today(probe))) {
      const w = weekKey(probe);
      if ((tmp[w] ?? 0) >= SAVERS_PER_WEEK) { gap.length = 0; break; }
      tmp[w] = (tmp[w] ?? 0) + 1; gap.push(new Date(probe)); probe.setDate(probe.getDate() - 1);
    }
    if (!gap.length) break;
    Object.assign(used, tmp); gap.forEach((g) => saved.push(today(g))); d.setTime(probe.getTime());
  }
  const leftThisWeek = SAVERS_PER_WEEK - (used[weekKey(now)] ?? 0);
  return { n, saved, leftThisWeek };
}

/** Consecutive study days ending today (or yesterday), with up to 2 saved days per week. */
export function streak(activity: Record<string, number>, goalsDone: Record<string, boolean> = {}) {
  return streakInfo(activity, goalsDone).n;
}

/** Days covered by a streak saver and savers still free this week. */
export function streakSavers(activity: Record<string, number>, goalsDone: Record<string, boolean> = {}) {
  const { saved, leftThisWeek } = streakInfo(activity, goalsDone);
  return { saved, left: Math.max(0, leftThisWeek) };
}

/** Push syllabus ticks made while offline once the connection is back. */
export async function flushPending(uid = state.userId) {
  const q = readQueue(); if (!uid || !q.length || !navigator.onLine) return;
  writeQueue([]);
  for (const p of q) {
    if (p.done) {
      warn(await supabase.from("progress").upsert({ user_id: uid, item_id: p.id }));
      warn(await supabase.from("activity").upsert({ user_id: uid, day: p.day, count: Math.max(p.count, state.activity[p.day] ?? 0) }));
    } else warn(await supabase.from("progress").delete().eq("user_id", uid).eq("item_id", p.id));
  }
}
if (typeof window !== "undefined") window.addEventListener("online", () => { void flushPending(); });

/** Longest run of consecutive study days ever logged. */
export function bestStreak(activity: Record<string, number>, goalsDone: Record<string, boolean> = {}) {
  const days = Array.from(new Set([...Object.keys(activity), ...Object.keys(goalsDone)]))
    .filter((k) => studiedOn(activity, goalsDone, k)).sort();
  let best = 0, run = 0, prev: number | null = null;
  for (const k of days) {
    const n = Date.parse(`${k}T00:00:00Z`) / 86400000;
    run = prev !== null && n - prev === 1 ? run + 1 : 1; prev = n; best = Math.max(best, run);
  }
  return best;
}
