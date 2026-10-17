import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, ChevronDown, Share2 } from "lucide-react";
import { Bar, Card } from "@/components/AppShell";
import { getState, toggleItem, useAppState } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { COEFFS, sortedSubjects, subjectPct, type Item, type ItemKind, type Unit } from "@/lib/syllabus";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Syllabus — BacFlow" },
      { name: "description", content: "Every Bac subject, unit, lesson, exercise and past paper from 2008 to 2026 — tick them off as you go." },
      { property: "og:title", content: "Syllabus — BacFlow" },
      { property: "og:description", content: "Every Bac subject, unit, lesson, exercise and past paper." },
    ],
  }),
  component: Subjects,
});

const KIND: Record<ItemKind, string> = { lesson: "text-violet", exercise: "text-cyan", summary: "text-mint", bac: "text-flame" };
const DIFF = { easy: "bg-mint/20 text-mint", medium: "bg-cyan/20 text-cyan", hard: "bg-flame/20 text-flame" };

const tick = (id: string, e: React.MouseEvent) => { if (toggleItem(id)) confetti({ particleCount: 50, spread: 55, origin: { x: e.clientX / innerWidth, y: e.clientY / innerHeight } }); };

function Subjects() {
  const s = useAppState();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      {sortedSubjects(s.stream).map((sub) => {
        const p = subjectPct(sub, s.done);
        const isOpen = open === sub.id;
        return (
          <Card key={sub.id} className="p-0">
            <button onClick={() => setOpen(isOpen ? null : sub.id)} className="flex w-full items-center gap-4 p-5 text-left">
              <div className="size-3 rounded-full" style={{ background: sub.color, boxShadow: `0 0 12px ${sub.color}` }} />
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-2"><span className="font-semibold">{sub.en}</span><span className="ar text-sm text-muted-foreground">{sub.ar}</span><span className="ml-auto text-xs rounded-full bg-muted px-2">×{COEFFS[s.stream][sub.id]}</span></div>
                <div className="mt-2 flex items-center gap-3"><div className="flex-1"><Bar pct={p} color={sub.color} /></div><span className="text-xs font-mono w-10 text-right">{p.toFixed(0)}%</span></div>
              </div>
              <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="grid gap-3 px-5 md:grid-cols-2">{sub.units.map((u, i) => <UnitBox key={u.id} n={i + 1} unit={u} subject={sub.en} />)}</div>
                  <div className="p-5">
                    <div className="mb-2 text-sm font-medium">Past Bac papers <span className="ar text-xs text-muted-foreground">مواضيع البكالوريا</span></div>
                    <div className="flex flex-wrap gap-2">
                      {sub.papers.map((it) => { const d = !!s.done[it.id]; return (
                        <button key={it.id} onClick={(e) => tick(it.id, e)} className={`rounded-lg px-2.5 py-1 text-xs font-mono border ${d ? "bg-flame text-primary-foreground border-flame" : "hover:bg-muted"}`}>{it.title.slice(4)}</button>
                      ); })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}

function Row({ it }: { it: Item }) {
  const s = useAppState();
  const done = !!s.done[it.id];
  return (
    <button onClick={(e) => tick(it.id, e)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
      <motion.span animate={{ scale: done ? [1, 1.3, 1] : 1 }} className={`size-4 rounded border-2 flex items-center justify-center ${done ? "bg-mint border-mint" : "border-muted-foreground"}`}>{done && <Check className="size-3 text-background" />}</motion.span>
      <span className={done ? "line-through text-muted-foreground" : ""}>{it.title}</span>
      {it.difficulty && <span className={`rounded-full px-1.5 text-[10px] capitalize ${DIFF[it.difficulty]}`}>{it.difficulty}</span>}
      <span className={`ml-auto text-[10px] uppercase font-bold ${KIND[it.kind]}`}>{it.kind}</span>
    </button>
  );
}

function UnitBox({ unit, subject, n }: { unit: Unit; subject: string; n: number }) {
  const nav = useNavigate();
  const share = async () => {
    const st = getState();
    await supabase.from("messages").insert({ room: "group", sender_name: st.name, text: "Let's study this together 📚", attach_kind: "unit", attach_label: `${subject} · ${unit.title}` });
    nav({ to: "/chat" });
  };
  return (
    <div className="rounded-xl border bg-card/40 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1"><div className="text-sm font-medium">{n}. {unit.title}</div><div dir="rtl" className="ar text-xs text-muted-foreground text-left">{unit.ar}</div></div>
        <button onClick={share} title="Share to group chat" className="size-8 flex items-center justify-center rounded-lg hover:bg-muted"><Share2 className="size-4" /></button>
      </div>
      {unit.items.map((it) => <Row key={it.id} it={it} />)}
    </div>
  );
}
