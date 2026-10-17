import { supabase } from "@/integrations/supabase/client";
import { overallPct, type Stream } from "./syllabus";
import { streak } from "./store";

export interface Friend { id: string; name: string; stream: Stream; streak: number; pct: number; last: string; active: boolean }

/** Friends of the signed-in user with live progress, streak and last activity. */
export async function fetchFriends(userId: string): Promise<Friend[]> {
  const { data: fs } = await supabase.from("friendships").select("friend_id").eq("user_id", userId);
  const ids = (fs ?? []).map((f) => f.friend_id);
  if (!ids.length) return [];
  const [p, pr, a] = await Promise.all([
    supabase.from("profiles").select("id,name,stream,last_activity").in("id", ids),
    supabase.from("progress").select("user_id,item_id").in("user_id", ids),
    supabase.from("activity").select("user_id,day,count").in("user_id", ids),
  ]);
  return (p.data ?? []).map((f) => {
    const done = Object.fromEntries((pr.data ?? []).filter((r) => r.user_id === f.id).map((r) => [r.item_id, true]));
    const act = Object.fromEntries((a.data ?? []).filter((r) => r.user_id === f.id).map((r) => [r.day, r.count]));
    const st = streak(act);
    return { id: f.id, name: f.name || "Student", stream: f.stream as Stream, streak: st, pct: Math.round(overallPct(f.stream as Stream, done)), last: f.last_activity, active: st > 0 };
  });
}
