import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { itemLabel, type Stream } from "./syllabus";

export interface Note { id: string; type: "formula" | "mistake" | "definition"; text: string; at: number }
export interface Target { id: string; text: string; done: boolean }
export interface State {
  userId: string | null; ready: boolean; onboarded: boolean; inviteCode: string;
  name: string; stream: Stream; theme: "dark" | "light";
  done: Record<string, boolean>;
  activity: Record<string, number>; // yyyy-mm-dd -> items done
  notes: Note[];
  targets: Target[];
}

export const today = (d = new Date()) => d.toISOString().slice(0, 10);

const DEFAULT: State = {
  userId: null, ready: false, onboarded: false, inviteCode: "",
  name: "", stream: "sci", theme: "dark", done: {}, activity: {}, notes: [], targets: [],
};

let state: State = DEFAULT;
const subs = new Set<() => void>();
function set(fn: (s: State) => State) { state = fn(state); subs.forEach((f) => f()); }

export function useAppState() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => DEFAULT);
}
export const getState = () => state;

const warn = (r: { error: unknown }) => { if (r.error) console.error(r.error); };

export async function loadUser(userId: string | null) {
  if (!userId) { set(() => ({ ...DEFAULT, ready: true })); return; }
  const [p, pr, a, n, t] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("progress").select("item_id").eq("user_id", userId),
    supabase.from("activity").select("day,count").eq("user_id", userId),
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
    supabase.from("targets").select("*").order("created_at"),
  ]);
  const prof = p.data;
  set(() => ({
    userId, ready: true,
    onboarded: !!prof?.onboarded, inviteCode: prof?.invite_code ?? "",
    name: prof?.name ?? "", stream: (prof?.stream as Stream) ?? "sci", theme: (prof?.theme as "dark" | "light") ?? "dark",
    done: Object.fromEntries((pr.data ?? []).map((r) => [r.item_id, true])),
    activity: Object.fromEntries((a.data ?? []).map((r) => [r.day, r.count])),
    notes: (n.data ?? []).map((r) => ({ id: r.id, type: r.type as Note["type"], text: r.text, at: +new Date(r.created_at) })),
    targets: (t.data ?? []).map((r) => ({ id: r.id, text: r.text, done: r.done })),
  }));
}

export async function updateProfile(patch: Partial<Pick<State, "name" | "stream" | "theme" | "onboarded">>) {
  set((s) => ({ ...s, ...patch }));
  if (state.userId) warn(await supabase.from("profiles").update(patch).eq("id", state.userId));
}

export function toggleItem(id: string) {
  const uid = state.userId; if (!uid) return false;
  const completed = !state.done[id];
  const d = today();
  const count = (state.activity[d] ?? 0) + (completed ? 1 : 0);
  set((s) => ({ ...s, done: { ...s.done, [id]: completed }, activity: completed ? { ...s.activity, [d]: count } : s.activity }));
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
  warn(await supabase.from("targets").update({ done: !t.done }).eq("id", id));
}

/** Consecutive study days ending today (or yesterday if nothing logged yet today). */
export function streak(activity: Record<string, number>) {
  const d = new Date();
  if (!activity[today(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (activity[today(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
