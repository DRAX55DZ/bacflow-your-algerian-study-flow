import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { Bar, Card } from "@/components/AppShell";
import { addTarget, deleteTarget, targetXp, bestStreak, toggleTarget, streak, studiedOn, today, useAppState } from "@/lib/store";
import { useT } from "@/lib/i18n";
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
  const st = streak(s.activity, s.allDone);
  const { t, lang } = useT();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2 flex items-center gap-6">
        <Ring pct={overall} />
        <div>
          <div className="text-sm text-muted-foreground">{t("Overall Bac completion")}</div>
          <div className="mt-2 text-4xl font-bold text-gradient">{overall.toFixed(1)}%</div>
          <Link to="/subjects" className="mt-3 inline-block text-sm text-primary hover:underline">{t("Continue studying →")}</Link>
        </div>
      </Card>
      <Card className="flex flex-col items-center justify-center text-center">
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="size-20 rounded-full bg-gradient-flame glow-flame flex items-center justify-center">
          <Flame className="size-10 text-primary-foreground" />
        </motion.div>
        <div className="mt-3 text-3xl font-bold">{st} {t(st === 1 ? "day" : "days")}</div>
        <div className="text-sm text-muted-foreground">{t("Study streak")}</div>
        <StreakExtras activity={s.activity} allDone={s.allDone} st={st} />
      </Card>

      <Countdown />
      <Targets />

      <Card className="md:col-span-3"><Heatmap activity={s.activity} allDone={s.allDone} /></Card>

      <Card className="md:col-span-3 overflow-x-auto">
        <h2 className="font-bold mb-3">{t("Subjects")}</h2>
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-start"><tr><th className="py-2 text-start">{t("Subject")}</th><th className="text-start">{t("Coeff")}</th><th className="w-1/2 text-start">{t("Progress")}</th><th className="text-end">%</th></tr></thead>
          <tbody>
            {sortedSubjects(s.stream).map((sub) => {
              const p = subjectPct(sub, s.done);
              return (
                <tr key={sub.id} className="border-t">
                  <td className="py-3"><div className="font-medium">{lang === "ar" ? sub.ar : sub.en}</div>{lang !== "ar" && <div className="text-xs text-muted-foreground ar">{sub.ar}</div>}</td>
                  <td><span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold">×{COEFFS[s.stream][sub.id]}</span></td>
                  <td className="pe-4"><Bar pct={p} color={sub.color} /></td>
                  <td className="text-end font-mono">{p.toFixed(0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

const GOALS = [3, 7, 14, 30, 60, 100, 200, 365];
function StreakExtras({ activity, allDone, st }: { activity: Record<string, number>; allDone: Record<string, boolean>; st: number }) {
  const { t } = useT();
  const [week, setWeek] = useState<{ k: string; on: boolean }[]>([]);
  useEffect(() => {
    const out: { k: string; on: boolean }[] = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = today(d); out.push({ k, on: studiedOn(activity, allDone, k) }); }
    setWeek(out);
  }, [activity, allDone]);
  const studied = week.length ? week[6]!.on : false;
  const best = Math.max(bestStreak(activity, allDone), st);
  const goal = GOALS.find((g) => g > st) ?? st + 100;
  return (
    <div className="mt-3 w-full space-y-2">
      <div className="flex justify-center gap-1.5">
        {week.map((w) => <Flame key={w.k} className={`size-4 ${w.on ? "text-flame" : "text-muted-foreground opacity-30"}`} />)}
      </div>
      <div className={`text-xs ${studied ? "text-mint" : "text-muted-foreground"}`}>{t(studied ? "✓ Studied today — streak safe" : "Tick an item or finish all today's targets to keep your streak")}</div>
      <div className="flex justify-between text-xs text-muted-foreground"><span>{t("Best")}: {best}</span><span>{t("Next goal")}: {goal}</span></div>
      <Bar pct={(st / goal) * 100} />
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
  const { t, lang } = useT();
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
      <div className="text-sm text-muted-foreground">{t("Countdown to Bac · June 2027")}</div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {parts.map(([v, l]) => (
          <div key={l} className="rounded-xl bg-muted p-3 text-center">
            <div className="text-3xl font-bold font-mono">{now === null ? "--" : String(v).padStart(2, "0")}</div>
            <div className="text-xs text-muted-foreground">{t(l)}</div>
          </div>
        ))}
      </div>
      <motion.div key={q} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
        <p className="ar text-lg text-right" dir="rtl">{QUOTES[q]!.ar}</p>
        {lang !== "ar" && <p className="text-sm text-muted-foreground">{QUOTES[q]!.en}</p>}
      </motion.div>
    </Card>
  );
}

const PRESETS = ["Solve 1 past Bac paper", "Do 3 exercises", "Review 1 lesson summary", "2 focus sessions (25 min)", "Learn 5 formulas", "Fix 1 past mistake"];

function Targets() {
  const s = useAppState();
  const [text, setText] = useState("");
  const { t } = useT();
  const done = s.targets.filter((x) => x.done).length;
  const total = s.targets.length;
  const xp = targetXp(s.targets);
  const all = total > 0 && done === total;
  const tick = (id: string, wasDone: boolean) => {
    toggleTarget(id);
    if (wasDone) return;
    if (done + 1 === total) { confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } }); setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 70, origin: { x: 0 } }), 250); setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 70, origin: { x: 1 } }), 400); }
    else confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };
  const unused = PRESETS.filter((p) => !s.targets.some((x) => x.text === t(p) || x.text === p));
  return (
    <Card>
      <div className="flex items-center gap-2">
        <h2 className="font-bold">{t("Today's targets")}</h2>
        <motion.span key={xp} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="ms-auto rounded-full bg-flame/20 px-2.5 py-0.5 text-xs font-bold text-flame">⚡ {xp} {t("XP today")}</motion.span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><motion.div animate={{ width: total ? `${(done / total) * 100}%` : "0%" }} className="h-full bg-gradient-brand" /></div>
        <span className="font-mono text-xs">{done}/{total}</span>
      </div>
      {all && (
        <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm font-semibold text-mint">
          🏆 {t("All done! +50 bonus XP")}
          <span className="mt-0.5 block text-xs font-bold text-flame">🔥 {t("Today's streak is safe")}</span>
        </motion.p>
      )}
      <ul className="mt-3 space-y-1">
        <AnimatePresence initial={false}>
          {s.targets.map((x) => (
            <motion.li key={x.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="group flex items-center gap-1">
              <button onClick={() => tick(x.id, x.done)} className="flex flex-1 items-center gap-3 rounded-xl p-2 text-left text-sm hover:bg-muted">
                <span className={`size-5 shrink-0 rounded-md border-2 flex items-center justify-center ${x.done ? "bg-mint border-mint" : "border-muted-foreground"}`}>{x.done && <Check className="size-3 text-background" />}</span>
                <span dir="auto" className={x.done ? "line-through text-muted-foreground" : ""}>{x.text}</span>
                <span className={`ms-auto text-[10px] font-bold ${x.done ? "text-mint" : "text-muted-foreground"}`}>+20</span>
              </button>
              <button onClick={() => deleteTarget(x.id)} aria-label={t("Delete")} className="size-8 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-flame flex items-center justify-center"><Trash2 className="size-3.5" /></button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; addTarget(text.trim()); setText(""); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Add a goal…")} className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm outline-none" />
        <button type="submit" aria-label={t("Add a goal…")} className="rounded-xl bg-primary px-3 text-primary-foreground"><Plus className="size-4" /></button>
      </form>
      {unused.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-xs text-muted-foreground">{t("Quick add")}</div>
          <div className="flex flex-wrap gap-1.5">{unused.map((p) => <button key={p} onClick={() => addTarget(t(p))} className="rounded-full border px-2.5 py-1 text-xs hover:bg-muted">+ {t(p)}</button>)}</div>
        </div>
      )}
    </Card>
  );
}

function Heatmap({ activity, allDone }: { activity: Record<string, number>; allDone: Record<string, boolean> }) {
  const days = useMemo(() => {
    const start = new Date("2026-09-01"); const out: string[] = [];
    const end = new Date(); for (const d = new Date(start); d <= end || out.length % 7; d.setDate(d.getDate() + 1)) out.push(today(d));
    return out.slice(-26 * 7);
  }, []);
  const { t } = useT();
  const lvl = (n: number) => (n === 0 ? "var(--heat-0)" : `color-mix(in oklab, var(--mint) ${Math.min(100, 25 + n * 15)}%, var(--heat-0))`);
  return (
    <>
      <h2 className="font-bold mb-3">{t("Study consistency")}</h2>
      <div className="grid grid-flow-col grid-rows-7 auto-cols-max gap-1 overflow-x-auto">
        {days.map((d) => <div key={d} title={`${d}: ${activity[d] ?? 0} items${allDone[d] ? ` · ${t("all goals done")}` : ""}`} className={`size-3.5 rounded-sm ${allDone[d] ? "ring-1 ring-flame" : ""}`} style={{ background: lvl(activity[d] ?? 0) }} />)}
      </div>
    </>
  );
}
