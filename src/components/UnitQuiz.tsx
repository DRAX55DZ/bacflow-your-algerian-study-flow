import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import confetti from "canvas-confetti";
import { Brain, Check, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateQuiz, type QuizQuestion } from "@/lib/quiz.functions";
import { getState, toggleItem, useAppState } from "@/lib/store";
import { STREAM_LABEL, type Item, type Unit } from "@/lib/syllabus";
import { useT } from "@/lib/i18n";

export const PASS_MARK = 4; // out of 5
export const passed = (score: number) => score >= PASS_MARK;

export function QuizRow({ it, unit, subject }: { it: Item; unit: Unit; subject: string }) {
  const s = useAppState();
  const done = !!s.done[it.id];
  const [open, setOpen] = useState(false);
  const { t, lang } = useT();
  const gen = useServerFn(generateQuiz);
  const [qs, setQs] = useState<QuizQuestion[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [picks, setPicks] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const start = async () => {
    setOpen(true); setQs(null); setErr(null); setPicks([]); setSubmitted(false);
    const r = await gen({ data: { subject, unit: unit.title, unitAr: unit.ar, stream: STREAM_LABEL[getState().stream].en } });
    if (r.error) setErr(r.error); else setQs(r.questions);
  };
  const score = qs ? qs.filter((q, i) => picks[i] === q.answer).length : 0;
  const submit = () => {
    setSubmitted(true);
    if (passed(score) && !getState().done[it.id]) { toggleItem(it.id); confetti({ particleCount: 120, spread: 80 }); }
  };

  return (
    <>
      <button onClick={start} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
        <span className={`size-4 rounded border-2 flex items-center justify-center ${done ? "bg-mint border-mint" : "border-muted-foreground"}`}>{done && <Check className="size-3 text-background" />}</span>
        <span>{done ? t("Quiz passed · retake") : t("Take the unit quiz")}</span>
        <Brain className="ms-auto size-3.5 text-violet" />
        <span className="text-[10px] uppercase font-bold text-violet">{t("quiz")}</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{lang === "ar" ? unit.ar : unit.title} — {t("quiz")}</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">{t("Get 4/5 to mark this unit's quiz as done.")}</p>
          {err && <p className="text-sm text-flame">{err} <button className="underline" onClick={start}>{t("Retry")}</button></p>}
          {!qs && !err && <div className="flex items-center gap-2 py-8 justify-center text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {t("Writing your questions…")}</div>}
          {qs && (
            <div className="space-y-4">
              {qs.map((q, i) => (
                <div key={i} className="space-y-1.5">
                  <div dir="auto" className="text-sm font-medium">{i + 1}. {q.q}</div>
                  {q.options.map((o, j) => {
                    const picked = picks[i] === j;
                    const tone = submitted ? (j === q.answer ? "border-mint bg-mint/15" : picked ? "border-flame bg-flame/15" : "") : picked ? "border-cyan bg-cyan/15" : "hover:bg-muted";
                    return (
                      <button key={j} dir="auto" disabled={submitted} onClick={() => setPicks((p) => { const n = [...p]; n[i] = j; return n; })} className={`flex w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-sm ${tone}`}>
                        {submitted && j === q.answer && <Check className="size-3.5 text-mint" />}
                        {submitted && picked && j !== q.answer && <X className="size-3.5 text-flame" />}
                        {o}
                      </button>
                    );
                  })}
                  {submitted && <p dir="auto" className="text-xs text-muted-foreground">{q.why}</p>}
                </div>
              ))}
              {!submitted ? (
                <button disabled={picks.filter((p) => p !== undefined).length < qs.length} onClick={submit} className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{t("Submit answers")}</button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${passed(score) ? "text-mint" : "text-flame"}`}>{score}/5 — {passed(score) ? t("Passed!") : t("Not yet, review the lesson and retry.")}</span>
                  <button onClick={start} className="ms-auto rounded-lg border px-3 py-1 text-sm hover:bg-muted">{t("New quiz")}</button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
