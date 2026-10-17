import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, BookOpen, Users, MessageCircle, Timer, Moon, Sun, NotebookPen, Flame, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { addNote, deleteNote, streak, updateProfile, useAppState, type Note } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { STREAM_LABEL, type Stream } from "@/lib/syllabus";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/subjects", label: "Syllabus", icon: BookOpen },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/focus", label: "Focus", icon: Timer },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const s = useAppState();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [drawer, setDrawer] = useState(false);
  const [alert, setAlert] = useState("");
  useEffect(() => {
    if (!s.userId) return;
    const ch = supabase.channel(`nudges-${s.userId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "nudges", filter: `to_id=eq.${s.userId}` }, async (p) => {
      const n = p.new as { id: string; from_id: string; kind: string };
      const { data } = await supabase.from("profiles").select("name").eq("id", n.from_id).maybeSingle();
      const who = data?.name || "A friend";
      setAlert(n.kind === "nudge" ? `📣 ${who} nudged you to study!` : `${n.kind} ${who} reacted to your progress`);
      setTimeout(() => setAlert(""), 4000);
      await supabase.from("nudges").update({ seen: true }).eq("id", n.id);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [s.userId]);

  return (
    <div className="min-h-screen md:pl-28">
      <nav className="glass fixed z-40 bottom-3 left-3 right-3 flex justify-around p-2 md:bottom-auto md:right-auto md:top-1/2 md:-translate-y-1/2 md:left-4 md:flex-col md:gap-2">
        <div className="hidden md:flex size-12 items-center justify-center rounded-xl bg-gradient-brand font-bold text-primary-foreground mb-2">B</div>
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = path === to;
          return (
            <Link key={to} to={to} title={label} className={`relative flex size-12 items-center justify-center rounded-xl transition-colors ${active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              {active && <motion.span layoutId="nav" className="absolute inset-0 rounded-xl bg-gradient-brand glow-violet" />}
              <Icon className="relative size-5" />
            </Link>
          );
        })}
      </nav>

      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="mr-auto">
            <div className="text-xl font-bold text-gradient">BacFlow</div>
            <div className="text-xs text-muted-foreground ar">بكالوريا الجزائر</div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-muted p-1">
            {(["sci", "math"] as Stream[]).map((k) => (
              <button key={k} onClick={() => updateProfile({ stream: k })} className="relative px-3 py-1.5 text-xs font-medium rounded-full">
                {s.stream === k && <motion.span layoutId="stream" className="absolute inset-0 rounded-full bg-gradient-brand" />}
                <span className={`relative ${s.stream === k ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  {STREAM_LABEL[k].en} · <span className="ar">{STREAM_LABEL[k].ar}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-gradient-flame px-3 py-1.5 text-sm font-bold text-primary-foreground glow-flame">
            <Flame className="size-4" /> {streak(s.activity)}
          </div>
          <button onClick={() => setDrawer(true)} title="Formula & mistake log" className="size-9 flex items-center justify-center rounded-full hover:bg-muted"><NotebookPen className="size-4" /></button>
          <button onClick={() => updateProfile({ theme: s.theme === "dark" ? "light" : "dark" })} title="Toggle theme" className="size-9 flex items-center justify-center rounded-full hover:bg-muted">
            {s.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button onClick={() => supabase.auth.signOut()} title="Sign out" className="size-9 flex items-center justify-center rounded-full hover:bg-muted"><LogOut className="size-4" /></button>
        </div>
      </header>

      <main className="px-4 pb-28 pt-6 md:pb-10 max-w-6xl mx-auto">{children}</main>
      {alert && <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 text-sm font-medium">{alert}</motion.div>}
      <NotesDrawer open={drawer} onClose={() => setDrawer(false)} notes={s.notes} />
    </div>
  );
}

function NotesDrawer({ open, onClose, notes }: { open: boolean; onClose: () => void; notes: Note[] }) {
  const [text, setText] = useState("");
  const [type, setType] = useState<Note["type"]>("formula");
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-background/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="glass fixed z-50 top-3 right-3 bottom-3 w-[min(24rem,calc(100%-1.5rem))] p-5 flex flex-col gap-4" initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ type: "spring", damping: 26 }}>
            <div className="flex items-center justify-between"><h2 className="font-bold">Formula & Mistake Log</h2><button onClick={onClose}><X className="size-4" /></button></div>
            <div className="flex gap-1">
              {(["formula", "definition", "mistake"] as const).map((t) => (
                <button key={t} onClick={() => setType(t)} className={`px-3 py-1 text-xs rounded-full capitalize ${type === t ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t}</button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; addNote(type, text.trim()); setText(""); }}>
              <input dir="auto" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. ln(ab) = ln a + ln b" className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm outline-none focus:ring-2 ring-ring" />
              <button className="rounded-xl bg-gradient-brand px-3 text-sm font-medium text-primary-foreground">Add</button>
            </form>
            <ul className="flex-1 overflow-auto space-y-2">
              {notes.length === 0 && <li className="text-sm text-muted-foreground">Nothing yet — capture formulas and tricky mistakes as you study.</li>}
              {notes.map((n) => (
                <li key={n.id} className="rounded-xl border p-3 text-sm flex gap-2">
                  <span className={`text-[10px] uppercase font-bold ${n.type === "mistake" ? "text-flame" : n.type === "formula" ? "text-cyan" : "text-mint"}`}>{n.type}</span>
                  <span dir="auto" className="flex-1">{n.text}</span>
                  <button onClick={() => deleteNote(n.id)}><X className="size-3 text-muted-foreground" /></button>
                </li>
              ))}
            </ul>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`glass p-5 ${className}`}>{children}</motion.section>;
}

export function Bar({ pct, color = "var(--violet)" }: { pct: number; color?: string }) {
  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: "spring", damping: 20 }} />
    </div>
  );
}
