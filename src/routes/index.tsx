import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, Flame } from "lucide-react";
import { Bar, Card } from "@/components/AppShell";
import { setState, streak, today, useAppState } from "@/lib/store";
import { COEFFS, overallPct, sortedSubjects, subjectPct } from "@/lib/syllabus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — BacFlow" },
      { name: "description", content: "Your weighted Bac Algérie completion, streak, countdown and study heatmap." },
      { property: "og:title", content: "Dashboard — BacFlow" },
      { property: "og:description", content: "Your weighted Bac Algérie completion, streak, countdown and study heatmap." },
    ],
  }),
  component: Dashboard,
});

const BAC_DATE = new Date("2027-06-13T08:00:00+01:00");
const QUOTES = [
  { ar: "من جدّ وجد، ومن زرع حصد", en: "Whoever strives, finds. Whoever sows, reaps." },
  { ar: "النجاح رحلة وليس محطة", en: "Success is a journey, not a station." },
  { ar: "قليل دائم خير من كثير منقطع", en: "A little done daily beats a lot done rarely." },
  { ar: "اصبر، فالبكالوريا تستحق", en: "Be patient — the Bac is worth it." },
];

function Dashboard() {
  const s = useAppState();
  const overall = overallPct(s.stream, s.done);
  const st = streak(s.activity);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2 flex items-center gap-6">
        <Ring pct={overall} />
        <div>
          <div className="text-sm text-muted-foreground">Overall Bac completion</div>
          <div className="text-xs text-muted-foreground ar">نسبة التحضير الإجمالية (حسب المعاملات)</div>
          <div className="mt-2 text-4xl font-bold text-gradient">{overall.toFixed(1)}%</div>
          <Link to="/subjects" className="mt-3 inline-block text-sm text-primary hover:underline">Continue studying →</Link>
        </div>
      </Card>
      <Card className="flex flex-col items-center justify-center text-center">
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="size-20 rounded-full bg-gradient-flame glow-flame flex items-center justify-center">
          <Flame className="size-10 text-primary-foreground" />
        </motion.div>
        <div className="mt-3 text-3xl font-bold">{st} day{st === 1 ? "" : "s"}</div>
        <div className="text-sm text-muted-foreground">Study streak · <span className="ar">سلسلة الأيام</span></div>
      </Card>

      <Countdown />
      <Targets />

      <Card className="md:col-span-3"><Heatmap activity={s.activity} /></Card>

      <Card className="md:col-span-3 overflow-x-auto">
        <h2 className="font-bold mb-3">Subjects</h2>
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-left"><tr><th className="py-2">Subject</th><th>Coeff</th><th className="w-1/2">Progress</th><th className="text-right">%</th></tr></thead>
          <tbody>
            {sortedSubjects(s.stream).map((sub) => {
              const p = subjectPct(sub, s.done);
              return (
                <tr key={sub.id} className="border-t">
                  <td className="py-3"><div className="font-medium">{sub.en}</div><div className="text-xs text-muted-foreground ar">{sub.ar}</div></td>
                  <td><span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold">×{COEFFS[s.stream][sub.id]}</span></td>
                  <td className="pr-4"><Bar pct={p} color={sub.color} /></td>
                  <td className="text-right font-mono">{p.toFixed(0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 120 120" className="size-32 shrink-0 -rotate-90">
      <defs><linearGradient id="rg"><stop offset="0" stopColor="var(--violet)" /><stop offset="1" stopColor="var(--cyan)" /></linearGradient></defs>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="12" />
      <motion.circle cx="60" cy="60" r={r} fill="none" stroke="url(#rg)" strokeWidth="12" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct / 100) }} transition={{ type: "spring", damping: 20 }} />
    </svg>
  );
}

function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  const [q, setQ] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    const k = setInterval(() => setQ((x) => (x + 1) % QUOTES.length), 8000);
    return () => { clearInterval(t); clearInterval(k); };
  }, []);
  const diff = Math.max(0, BAC_DATE.getTime() - (now ?? BAC_DATE.getTime()));
  const parts = [[Math.floor(diff / 864e5), "days"], [Math.floor(diff / 36e5) % 24, "hrs"], [Math.floor(diff / 6e4) % 60, "min"], [Math.floor(diff / 1e3) % 60, "sec"]] as const;
  return (
    <Card className="md:col-span-2">
      <div className="text-sm text-muted-foreground">Countdown to Bac · June 2027 · <span className="ar">العد التنازلي للبكالوريا</span></div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {parts.map(([v, l]) => (
          <div key={l} className="rounded-xl bg-muted p-3 text-center">
            <div className="text-3xl font-bold font-mono">{now === null ? "--" : String(v).padStart(2, "0")}</div>
            <div className="text-xs text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
      <motion.div key={q} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
        <p className="ar text-lg text-right" dir="rtl">{QUOTES[q].ar}</p>
        <p className="text-sm text-muted-foreground">{QUOTES[q].en}</p>
      </motion.div>
    </Card>
  );
}

function Targets() {
  const s = useAppState();
  const [text, setText] = useState("");
  return (
    <Card>
      <h2 className="font-bold">Today's targets <span className="ar text-xs text-muted-foreground">أهداف اليوم</span></h2>
      <ul className="mt-3 space-y-2">
        {s.targets.map((t) => (
          <li key={t.id}>
            <button onClick={() => { if (!t.done) confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } }); setState((x) => ({ ...x, targets: x.targets.map((y) => (y.id === t.id ? { ...y, done: !y.done } : y)) })); }} className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm hover:bg-muted">
              <span className={`size-5 shrink-0 rounded-md border-2 flex items-center justify-center ${t.done ? "bg-mint border-mint" : "border-muted-foreground"}`}>{t.done && <Check className="size-3 text-background" />}</span>
              <span className={t.done ? "line-through text-muted-foreground" : ""}>{t.text}</span>
            </button>
          </li>
        ))}
      </ul>
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; setState((x) => ({ ...x, targets: [...x.targets, { id: crypto.randomUUID(), text, done: false }] })); setText(""); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a goal…" className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm outline-none" />
      </form>
    </Card>
  );
}

function Heatmap({ activity }: { activity: Record<string, number> }) {
  const days = useMemo(() => {
    const start = new Date("2026-09-01"); const out: string[] = [];
    const end = new Date(); for (const d = new Date(start); d <= end || out.length % 7; d.setDate(d.getDate() + 1)) out.push(today(d));
    return out.slice(-26 * 7);
  }, []);
  const lvl = (n: number) => (n === 0 ? "var(--heat-0)" : `color-mix(in oklab, var(--mint) ${Math.min(100, 25 + n * 15)}%, var(--heat-0))`);
  return (
    <>
      <h2 className="font-bold mb-3">Study consistency <span className="ar text-xs text-muted-foreground">خريطة المراجعة</span></h2>
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
        {days.map((d) => <div key={d} title={`${d}: ${activity[d] ?? 0} items`} className="size-3.5 rounded-sm" style={{ background: lvl(activity[d] ?? 0) }} />)}
      </div>
    </>
  );
}
