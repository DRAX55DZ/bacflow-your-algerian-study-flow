import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Copy, Flame } from "lucide-react";
import { Bar, Card } from "@/components/AppShell";
import { FRIENDS } from "@/lib/friends";
import { overallPct, STREAM_LABEL } from "@/lib/syllabus";
import { streak, useAppState } from "@/lib/store";

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
  const [reacts, setReacts] = useState<Record<string, string>>({});
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2000); };
  const me = { id: "me", name: `${s.name} (you)`, stream: s.stream, streak: streak(s.activity), pct: Math.round(overallPct(s.stream, s.done)), last: "", active: true };
  const board = [...FRIENDS, me].sort((a, b) => b.pct - a.pct);
  const code = "BAC-7K2Q";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <h2 className="font-bold">Invite classmates</h2>
        <p className="text-sm text-muted-foreground mt-1">Share your code so friends can add you.</p>
        <button onClick={() => { navigator.clipboard?.writeText(code); flash("Invite code copied"); }} className="mt-4 flex w-full items-center justify-between rounded-xl border-2 border-dashed border-primary p-4 font-mono text-xl font-bold">
          {code}<Copy className="size-4" />
        </button>
      </Card>
      <Card className="md:col-span-2">
        <h2 className="font-bold mb-3">Leaderboard <span className="ar text-xs text-muted-foreground">لوحة الصدارة</span></h2>
        <ul className="space-y-2">
          {board.map((f, i) => (
            <motion.li layout key={f.id} className={`flex flex-wrap items-center gap-3 rounded-xl p-3 ${f.id === "me" ? "bg-accent" : "bg-muted/50"}`}>
              <span className={`w-6 text-center font-bold ${i === 0 ? "text-flame" : "text-muted-foreground"}`}>{i + 1}</span>
              <div className="size-9 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-primary-foreground">{f.name[0]}</div>
              <div className="flex-1 min-w-32">
                <div className="text-sm font-medium">{f.name} <span className="text-xs text-muted-foreground">· {STREAM_LABEL[f.stream].en}</span></div>
                {f.last && <div className="text-xs text-muted-foreground">{f.last}</div>}
                <div className="mt-1 w-40"><Bar pct={f.pct} color={f.stream === "math" ? "var(--violet)" : "var(--mint)"} /></div>
              </div>
              <span className="text-sm font-mono">{f.pct}%</span>
              <span className="flex items-center gap-1 text-sm text-flame"><Flame className="size-4" />{f.streak}</span>
              {f.id !== "me" && (
                <div className="flex items-center gap-1">
                  {["🔥", "👏", "📚", "⚡"].map((e) => (
                    <motion.button whileTap={{ scale: 1.5 }} key={e} onClick={() => { setReacts((r) => ({ ...r, [f.id]: e })); flash(`Sent ${e} to ${f.name}`); }} className={`rounded-lg px-1.5 py-1 hover:bg-background ${reacts[f.id] === e ? "bg-background" : ""}`}>{e}</motion.button>
                  ))}
                  {!f.active && <button onClick={() => flash(`Nudged ${f.name} to study 📣`)} className="ml-1 flex items-center gap-1 rounded-lg bg-gradient-flame px-2 py-1 text-xs font-medium text-primary-foreground"><Bell className="size-3" />Nudge</button>}
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
