import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/AppShell";
import { useT } from "@/lib/i18n";
import { today } from "@/lib/store";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus Timer — BacFlow" },
      { name: "description", content: "Pomodoro study timer with presets, ambient sounds and session stats for Bac revision." },
      { property: "og:title", content: "Focus Timer — BacFlow" },
      { property: "og:description", content: "Pomodoro study timer with ambient sound and daily focus stats." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Focus,
});

type Mode = "work" | "break" | "long";
const PRESETS = [
  { label: "25 / 5", work: 25, brk: 5 },
  { label: "50 / 10", work: 50, brk: 10 },
  { label: "90 / 20", work: 90, brk: 20 },
];
const SOUNDS = ["Rain", "Brown noise", "Café"] as const;
type Sound = (typeof SOUNDS)[number] | null;
const STATS_KEY = "bacflow-focus-stats";

function loadStats(): Record<string, { sessions: number; minutes: number }> {
  try { return JSON.parse(localStorage.getItem(STATS_KEY) || "{}"); } catch { return {}; }
}

function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.25, 0.5].forEach((t, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = i === 2 ? 1046 : 784; o.connect(g).connect(ctx.destination);
      g.gain.setValueAtTime(0.25, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.22);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.24);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch { /* ignore */ }
}

function Focus() {
  const { t } = useT();
  const [work, setWork] = useState(25);
  const [brk, setBrk] = useState(5);
  const [mode, setMode] = useState<Mode>("work");
  const [left, setLeft] = useState(25 * 60);
  const [run, setRun] = useState(false);
  const [sound, setSound] = useState<Sound>(null);
  const [round, setRound] = useState(0);
  const [stats, setStats] = useState<Record<string, { sessions: number; minutes: number }>>({});
  const endAt = useRef<number | null>(null);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => { setStats(loadStats()); }, []);

  const dur = (m: Mode) => (m === "work" ? work : m === "long" ? brk * 3 : brk) * 60;

  const finish = () => {
    beep();
    if (mode === "work") {
      confetti({ particleCount: 120, spread: 90 });
      const d = today(new Date()); const s = loadStats();
      s[d] = { sessions: (s[d]?.sessions ?? 0) + 1, minutes: (s[d]?.minutes ?? 0) + work };
      localStorage.setItem(STATS_KEY, JSON.stringify(s)); setStats(s);
      const r = round + 1; setRound(r);
      const next: Mode = r % 4 === 0 ? "long" : "break";
      setMode(next); setLeft(dur(next)); endAt.current = Date.now() + dur(next) * 1000;
    } else {
      setMode("work"); setLeft(dur("work")); endAt.current = Date.now() + dur("work") * 1000;
    }
    if ("Notification" in window && Notification.permission === "granted") new Notification(mode === "work" ? "Break time ☕" : "Back to focus 📚");
  };

  // Timestamp-based ticking so the timer stays accurate in background tabs.
  useEffect(() => {
    if (!run) { endAt.current = null; return; }
    endAt.current = Date.now() + left * 1000;
    const id = setInterval(() => {
      const rem = Math.max(0, Math.round(((endAt.current ?? Date.now()) - Date.now()) / 1000));
      setLeft(rem);
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, mode]);

  useEffect(() => { if (run && left === 0) finish(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [left, run]);

  useEffect(() => {
    const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
    document.title = run ? `${mm}:${ss} · ${mode === "work" ? "Focus" : "Break"} — BacFlow` : "Focus Timer — BacFlow";
  }, [left, run, mode]);

  useEffect(() => {
    audio.current?.close(); audio.current = null;
    if (!sound) return;
    const ctx = new AudioContext(); audio.current = ctx;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate); const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      if (sound === "Brown noise") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else if (sound === "Rain") { d[i] = w * 0.35 * (Math.random() < 0.002 ? 3 : 1); }
      else { last = (last + 0.05 * w) / 1.05; d[i] = last * 2 + (Math.random() < 0.0004 ? w : 0); }
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = sound === "Rain" ? 2500 : 900;
    const g = ctx.createGain(); g.gain.value = 0.25; src.connect(f).connect(g).connect(ctx.destination); src.start();
    return () => { ctx.close(); };
  }, [sound]);

  const total = dur(mode);
  const r = 110, c = 2 * Math.PI * r;
  const reset = () => { setRun(false); setMode("work"); setLeft(work * 60); };
  const start = () => {
    if (!run && "Notification" in window && Notification.permission === "default") Notification.requestPermission();
    setRun(!run);
  };
  const applyPreset = (w: number, b: number) => { setWork(w); setBrk(b); setRun(false); setMode("work"); setLeft(w * 60); };
  const d = stats[today(new Date())] ?? { sessions: 0, minutes: 0 };
  const color = mode === "work" ? "var(--violet)" : "var(--mint)";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2 flex flex-col items-center py-10">
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {(["work", "break", "long"] as Mode[]).map((m) => (
            <button key={m} onClick={() => { setRun(false); setMode(m); setLeft(dur(m)); }} className={`rounded-full px-3 py-1 text-xs font-medium ${mode === m ? "bg-gradient-brand text-primary-foreground" : "text-muted-foreground"}`}>
              {t(m === "work" ? "Focus" : m === "break" ? "Short break" : "Long break")}
            </button>
          ))}
        </div>
        <div className="relative mt-6">
          <svg viewBox="0 0 260 260" className="size-64 -rotate-90">
            <circle cx="130" cy="130" r={r} fill="none" stroke="var(--muted)" strokeWidth="14" />
            <motion.circle cx="130" cy="130" r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - left / total) }} transition={{ ease: "linear", duration: 0.3 }} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold font-mono">{String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</div>
            <div className="mt-2 flex gap-1.5">{[0, 1, 2, 3].map((i) => <span key={i} className={`size-2 rounded-full ${i < round % 4 ? "bg-mint" : "bg-muted"}`} />)}</div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={start} className="flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 font-medium text-primary-foreground glow-violet">{run ? <Pause className="size-4" /> : <Play className="size-4" />}{run ? t("Pause") : t("Start")}</button>
          <button onClick={reset} title={t("Reset")} className="rounded-full bg-muted p-3"><RotateCcw className="size-4" /></button>
          <button onClick={() => { setLeft(0); if (!run) finish(); }} title={t("Skip")} className="rounded-full bg-muted p-3"><SkipForward className="size-4" /></button>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => setSound(null)} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${!sound ? "bg-primary text-primary-foreground" : "bg-muted"}`}><VolumeX className="size-3" />{t("Silent")}</button>
          {SOUNDS.map((s) => (
            <button key={s} onClick={() => setSound(s)} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${sound === s ? "bg-mint text-background" : "bg-muted"}`}><Volume2 className="size-3" />{t(s)}</button>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 content-start">
        <Card>
          <h2 className="font-bold">{t("Today")}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-muted p-3"><div className="text-2xl font-bold text-gradient">{d.sessions}</div><div className="text-xs text-muted-foreground">{t("sessions")}</div></div>
            <div className="rounded-xl bg-muted p-3"><div className="text-2xl font-bold text-gradient">{d.minutes}</div><div className="text-xs text-muted-foreground">{t("minutes focused")}</div></div>
          </div>
        </Card>
        <Card>
          <h2 className="font-bold">{t("Settings")}</h2>
          <div className="mt-3 flex gap-2">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p.work, p.brk)} className={`flex-1 rounded-xl py-2 text-xs font-mono ${work === p.work && brk === p.brk ? "bg-gradient-brand text-primary-foreground" : "bg-muted"}`}>{p.label}</button>
            ))}
          </div>
          {([["Focus (min)", work, setWork, "work"], ["Break (min)", brk, setBrk, "break"]] as const).map(([l, v, set, m]) => (
            <label key={l} className="mt-4 block text-sm">
              <span className="text-muted-foreground">{t(l)}</span>
              <input type="number" min={1} max={180} value={v} onChange={(e) => { const n = Math.min(180, Math.max(1, +e.target.value || 1)); set(n); if (!run && mode === m) setLeft(n * 60); }} className="mt-1 w-full rounded-xl bg-muted px-3 py-2 outline-none" />
            </label>
          ))}
          <p className="mt-4 text-xs text-muted-foreground">{t("Every 4th break is a long break. Tip: open the notebook icon at the top to log formulas mid-session.")}</p>
        </Card>
      </div>
    </div>
  );
}
