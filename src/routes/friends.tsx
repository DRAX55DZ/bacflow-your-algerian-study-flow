import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Copy, Flame, UserPlus } from "lucide-react";
import { Bar, Card } from "@/components/AppShell";
import { fetchEveryone, type Friend } from "@/lib/friends";
import { overallPct, STREAM_LABEL } from "@/lib/syllabus";
import { streak, useAppState } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/friends")({
  head: () => ({
    meta: [
      { title: "Friends & Leaderboard — BacFlow" },
      { name: "description", content: "Compete with classmates across Science and Math streams, react and nudge each other." },
      { property: "og:title", content: "Friends & Leaderboard — BacFlow" },
      { property: "og:description", content: "Cross-stream Bac leaderboard with classmates." },
    ],
  }),
  component: Friends,
});

function Friends() {
  const s = useAppState();
  const [toast, setToast] = useState("");
  const { t } = useT();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [code, setCode] = useState("");
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const reload = () => { if (s.userId) fetchEveryone().then((all) => setFriends(all.filter((f) => f.id !== s.userId))); };

  useEffect(() => {
    reload();
    const ch = supabase.channel("board").on("postgres_changes", { event: "*", schema: "public", table: "progress" }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, reload).subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.userId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); if (!code.trim()) return;
    const { data, error } = await supabase.rpc("add_friend", { _code: code });
    if (error) return flash(error.message);
    flash(`Added ${(data as { name: string }).name || "friend"} 🎉`); setCode(""); reload();
  };
  const send = async (f: Friend, kind: string) => {
    const { error } = await supabase.from("nudges").insert({ to_id: f.id, kind });
    flash(error ? "Couldn't send" : kind === "nudge" ? `Nudged ${f.name} to study 📣` : `Sent ${kind} to ${f.name}`);
  };

  const me = { id: "me", name: `${s.name} (${t("you")})`, stream: s.stream, streak: streak(s.activity), pct: Math.round(overallPct(s.stream, s.done)), last: "", active: true };
  const board = [...friends, me].sort((a, b) => b.pct - a.pct);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-4">
        <Card>
          <h2 className="font-bold">{t("Your invite code")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("Share it so friends can add you.")}</p>
          <button onClick={() => { navigator.clipboard?.writeText(s.inviteCode); flash(t("Invite code copied")); }} className="mt-4 flex w-full items-center justify-between rounded-xl border-2 border-dashed border-primary p-4 font-mono text-xl font-bold">
            {s.inviteCode}<Copy className="size-4" />
          </button>
        </Card>
        <Card>
          <h2 className="font-bold">{t("Add a friend")}</h2>
          <form onSubmit={add} className="mt-3 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="BAC-XXXX" className="flex-1 min-w-0 rounded-xl bg-muted px-3 py-2 font-mono text-sm outline-none focus:ring-2 ring-ring" />
            <button className="flex items-center gap-1 rounded-xl bg-gradient-brand px-3 text-sm font-medium text-primary-foreground"><UserPlus className="size-4" />{t("Add")}</button>
          </form>
        </Card>
      </div>
      <Card className="md:col-span-2">
        <h2 className="font-bold mb-3">{t("Leaderboard")}</h2>
        {friends.length === 0 && <p className="mb-3 text-sm text-muted-foreground">{t("No other students yet — invite your classmates!")}</p>}
        <ul className="space-y-2">
          {board.map((f, i) => (
            <motion.li layout key={f.id} className={`flex flex-wrap items-center gap-3 rounded-xl p-3 ${f.id === "me" ? "bg-accent" : "bg-muted/50"}`}>
              <span className={`w-6 text-center font-bold ${i === 0 ? "text-flame" : "text-muted-foreground"}`}>{i + 1}</span>
              <div className="size-9 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-primary-foreground">{f.name[0]}</div>
              <div className="flex-1 min-w-32">
                <div className="text-sm font-medium">{f.name} <span className="text-xs text-muted-foreground">· {t(STREAM_LABEL[f.stream].en)}</span></div>
                {f.last && <div className="text-xs text-muted-foreground">{f.last}</div>}
                <div className="mt-1 w-40"><Bar pct={f.pct} color={f.stream === "math" ? "var(--violet)" : "var(--mint)"} /></div>
              </div>
              <span className="text-sm font-mono">{f.pct}%</span>
              <span className="flex items-center gap-1 text-sm text-flame"><Flame className="size-4" />{f.streak}</span>
              {f.id !== "me" && (
                <div className="flex items-center gap-1">
                  {["🔥", "👏", "📚", "⚡"].map((e) => (
                    <motion.button whileTap={{ scale: 1.5 }} key={e} onClick={() => send(f as Friend, e)} className="rounded-lg px-1.5 py-1 hover:bg-background">{e}</motion.button>
                  ))}
                  <button onClick={() => send(f as Friend, "nudge")} className="ms-1 flex items-center gap-1 rounded-lg bg-gradient-flame px-2 py-1 text-xs font-medium text-primary-foreground"><Bell className="size-3" />{t("Nudge")}</button>
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      </Card>
      {toast && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 text-sm z-50">{toast}</motion.div>}
    </div>
  );
}
