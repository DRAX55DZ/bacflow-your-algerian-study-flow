import { useSyncExternalStore } from "react";
import type { Stream } from "./syllabus";

export interface Note { id: string; type: "formula" | "mistake" | "definition"; text: string; at: number }
export interface ChatMsg { id: string; room: string; from: string; text: string; at: number; attach?: undefined | { kind: "pdf" | "image" | "voice" | "unit"; label: string } }
export interface State {
  name: string; stream: Stream; theme: "dark" | "light";
  done: Record<string, boolean>;
  activity: Record<string, number>; // yyyy-mm-dd -> items done
  notes: Note[]; messages: ChatMsg[];
  targets: { id: string; text: string; done: boolean }[];
}

const KEY = "bacflow-v1";
export const today = (d = new Date()) => d.toISOString().slice(0, 10);

const DEFAULT: State = {
  name: "You", stream: "sci", theme: "dark", done: {}, activity: {}, notes: [], messages: [],
  targets: [
    { id: "t1", text: "Complete 2 Physics exercises", done: false },
    { id: "t2", text: "Read 1 Math unit summary", done: false },
    { id: "t3", text: "Solve 1 past Bac topic", done: false },
  ],
};

let state: State = DEFAULT;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = { ...DEFAULT, ...JSON.parse(raw) }; } catch { /* ignore */ }
}

export function setState(fn: (s: State) => State) {
  load();
  state = fn(state);
  localStorage.setItem(KEY, JSON.stringify(state));
  subs.forEach((f) => f());
}

export function useAppState() {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => { load(); return state; },
    () => DEFAULT,
  );
}

export function toggleItem(id: string) {
  let completed = false;
  setState((s) => {
    completed = !s.done[id];
    const d = today();
    return {
      ...s, done: { ...s.done, [id]: completed },
      activity: completed ? { ...s.activity, [d]: (s.activity[d] ?? 0) + 1 } : s.activity,
    };
  });
  return completed;
}

/** Consecutive study days ending today (or yesterday if nothing logged yet today). */
export function streak(activity: Record<string, number>) {
  const d = new Date();
  if (!activity[today(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (activity[today(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
