import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/AppShell";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus Timer — BacFlow" },
      { name: "description", content: "Pomodoro study timer with ambient sound for deep Bac revision." },
      { property: "og:title", content: "Focus Timer — BacFlow" },
      { property: "og:description", content: "Pomodoro study timer with ambient sound." },
    ],
  }),
  component: Focus,
});

function Focus() {
  const { t } = useT();
  const [work, setWork] = useState(25);
  const [brk, setBrk] = useState(5);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [left, setLeft] = useState(25 * 60);
  const [run, setRun] = useState(false);
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setLeft((l) => {
      if (l > 1) return l - 1;
      if (mode === "work") confetti({ particleCount: 120, spread: 90 });
      const next = mode === "work" ? "break" : "work";
      setMode(next);
      return (next === "work" ? work : brk) * 60;
    }), 1000);
    return () => clearInterval(t);
  }, [run, mode, work, brk]);

  useEffect(() => {
    if (!sound) { audio.current?.close(); audio.current = null; return; }
    const ctx = new AudioContext(); audio.current = ctx;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const g = ctx.createGain(); g.gain.value = 0.25; src.connect(g).connect(ctx.destination); src.start();
  }, [sound]);

  const total = (mode === "work" ? work : brk) * 60;
  const r = 110, c = 2 * Math.PI * r;
  const reset = () => { setRun(false); setMode("work"); setLeft(work * 60); };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2 flex flex-col items-center py-10">
        <div className={`text-sm font-bold uppercase tracking-widest ${mode === "work" ? "text-violet" : "text-mint"}`}>{mode === "work" ? t("Focus · تركيز") : t("Break · استراحة")}</div>
        <div className="relative mt-4">
          <svg viewBox="0 0 260 260" className="size-64 -rotate-90">
            <circle cx="130" cy="130" r={r} fill="none" stroke="var(--muted)" strokeWidth="14" />
            <motion.circle cx="130" cy="130" r={r} fill="none" stroke={mode === "work" ? "var(--violet)" : "var(--mint)"} strokeWidth="14" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - left / total) }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold font-mono">{String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={() => setRun(!run)} className="flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 font-medium text-primary-foreground glow-violet">{run ? <Pause className="size-4" /> : <Play className="size-4" />}{run ? t("Pause") : t("Start")}</button>
          <button onClick={reset} className="rounded-full bg-muted p-3"><RotateCcw className="size-4" /></button>
          <button onClick={() => setSound(!sound)} title="Ambient sound" className={`rounded-full p-3 ${sound ? "bg-mint text-background" : "bg-muted"}`}>{sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}</button>
        </div>
      </Card>
      <Card>
        <h2 className="font-bold">{t("Settings")}</h2>
        {[["Focus (min)", work, setWork], ["Break (min)", brk, setBrk]].map(([l, v, set]) => (
          <label key={l as string} className="mt-4 block text-sm">
            <span className="text-muted-foreground">{t(l as string)}</span>
            <input type="number" min={1} max={90} value={v as number} onChange={(e) => { const n = Math.max(1, +e.target.value); (set as (n: number) => void)(n); if (!run) setLeft((l === "Focus (min)" ? (mode === "work" ? n : brk) : mode === "break" ? n : work) * 60); }} className="mt-1 w-full rounded-xl bg-muted px-3 py-2 outline-none" />
          </label>
        ))}
        <p className="mt-4 text-xs text-muted-foreground">{t("Tip: open the notebook icon at the top to log formulas and mistakes mid-session.")}</p>
      </Card>
    </div>
  );
}
