import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getLesson } from "@/lib/lesson.functions";
import { getState } from "@/lib/store";
import { STREAM_LABEL, type Unit } from "@/lib/syllabus";
import { useT } from "@/lib/i18n";

/** Tiny Markdown renderer: headings, bullets, bold, paragraphs. */
function Md({ text }: { text: string }) {
  const bold = (s: string): ReactNode[] => s.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));
  return (
    <div dir="auto" className="space-y-2 text-sm leading-relaxed">
      {text.split("\n").map((l, i) => {
        const t = l.trim();
        if (!t) return null;
        if (t.startsWith("### ")) return <h4 key={i} className="pt-2 font-semibold">{bold(t.slice(4))}</h4>;
        if (t.startsWith("## ") || t.startsWith("# ")) return <h3 key={i} className="pt-3 text-base font-bold text-gradient">{bold(t.replace(/^#+ /, ""))}</h3>;
        if (/^[-*] /.test(t)) return <p key={i} className="ps-4">• {bold(t.slice(2))}</p>;
        return <p key={i}>{bold(t)}</p>;
      })}
    </div>
  );
}

export function LessonButton({ unit, subject }: { unit: Unit; subject: string }) {
  const { t, lang } = useT();
  const gen = useServerFn(getLesson);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = async () => {
    setOpen(true); setErr(null); setText(null);
    const st = getState().stream;
    const r = await gen({ data: { key: `${st}-${unit.id}`, subject, unit: unit.title, unitAr: unit.ar, stream: STREAM_LABEL[st].en, lang } });
    if (r.error) setErr(r.error); else setText(r.content);
  };
  return (
    <>
      <button onClick={load} className="mb-1 flex w-full items-center gap-2 rounded-lg bg-gradient-brand/10 border border-primary/30 px-2 py-1.5 text-sm font-medium hover:bg-muted">
        <GraduationCap className="size-4 text-cyan" /> {t("Official lesson")}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{lang === "ar" ? unit.ar : unit.title}</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">{t("Follows the official Algerian Bac program. Written by AI — check with your teacher.")}</p>
          {err && <p className="text-sm text-flame">{err} <button className="underline" onClick={load}>{t("Retry")}</button></p>}
          {!text && !err && <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {t("Writing the lesson…")}</div>}
          {text && <Md text={text} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
