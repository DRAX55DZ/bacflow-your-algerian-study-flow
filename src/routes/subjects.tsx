import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, ChevronDown, Share2 } from "lucide-react";
import { Bar, Card } from "@/components/AppShell";
import { setState, toggleItem, useAppState } from "@/lib/store";
import { COEFFS, sortedSubjects, subjectPct, type ItemKind, type Unit } from "@/lib/syllabus";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Syllabus — BacFlow" },
      { name: "description", content: "Every Bac subject, unit, lesson, exercise and past paper — tick them off as you go." },
      { property: "og:title", content: "Syllabus — BacFlow" },
      { property: "og:description", content: "Every Bac subject, unit, lesson, exercise and past paper." },
    ],
  }),
  component: Subjects,
});

const KIND: Record<ItemKind, string> = { lesson: "text-violet", exercise: "text-cyan", summary: "text-mint", bac: "text-flame" };

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
                <div className="flex items-baseline gap-2"><span className="font-semibold">{sub.en}</span><span className="ar text-sm text-muted-foreground">{sub.ar}</span><span className="ml-auto text-xs rounded-full bg-muted px-2">×{COEFFS[s.stream][sub.id]}</span></div>
                <div className="mt-2 flex items-center gap-3"><div className="flex-1"><Bar pct={p} color={sub.color} /></div><span className="text-xs font-mono w-10 text-right">{p.toFixed(0)}%</span></div>
              </div>
              <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="grid gap-3 px-5 pb-5 md:grid-cols-2">{sub.units.map((u) => <UnitBox key={u.id} unit={u} subject={sub.en} />)}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}

function UnitBox({ unit, subject }: { unit: Unit; subject: string }) {
  const s = useAppState();
  const nav = useNavigate();
  const share = () => {
    setState((x) => ({ ...x, messages: [...x.messages, { id: crypto.randomUUID(), room: "group-bac", from: x.name, text: "Let's study this together 📚", at: Date.now(), attach: { kind: "unit", label: `${subject} · ${unit.title}` } }] }));
    nav({ to: "/chat" });
  };
  return (
    <div className="rounded-xl border bg-card/40 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1"><div className="text-sm font-medium">{unit.title}</div><div className="ar text-xs text-muted-foreground">الوحدة: {unit.ar}</div></div>
        <button onClick={share} title="Share to chat" className="size-8 flex items-center justify-center rounded-lg hover:bg-muted"><Share2 className="size-4" /></button>
      </div>
      {unit.items.map((it) => {
        const done = !!s.done[it.id];
        return (
          <button key={it.id} onClick={(e) => { if (toggleItem(it.id)) confetti({ particleCount: 50, spread: 55, origin: { x: e.clientX / innerWidth, y: e.clientY / innerHeight } }); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
            <motion.span animate={{ scale: done ? [1, 1.3, 1] : 1 }} className={`size-4 rounded border-2 flex items-center justify-center ${done ? "bg-mint border-mint" : "border-muted-foreground"}`}>{done && <Check className="size-3 text-background" />}</motion.span>
            <span className={done ? "line-through text-muted-foreground" : ""}>{it.title}</span>
            <span className={`ml-auto text-[10px] uppercase font-bold ${KIND[it.kind]}`}>{it.kind}</span>
          </button>
        );
      })}
    </div>
  );
}
