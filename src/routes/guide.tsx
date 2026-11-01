import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card } from "@/components/AppShell";
import { useT } from "@/lib/i18n";
import { GUIDE_INTRO, GUIDE_HEADERS, RESTART_PLAN, TECHNIQUES, WEEKLY_PLAN } from "@/lib/guide";
import { CalendarCheck, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Study Guide — BacFlow" },
      { name: "description", content: "Proven study techniques for the Algerian Bac: active recall, spaced repetition, past papers, and a 7-day restart plan for students who feel far behind." },
      { property: "og:title", content: "Study Guide — BacFlow" },
      { property: "og:description", content: "Proven study techniques for the Algerian Bac, even if you're starting from zero." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  const { lang } = useT();
  const L = (b: { en: string; ar: string }) => (lang === "ar" ? b.ar : b.en);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient">{L(GUIDE_HEADERS.title)}</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl" dir="auto">{L(GUIDE_INTRO)}</p>
      </div>

      <Card>
        <h2 className="font-bold flex items-center gap-2 mb-4"><CalendarCheck className="size-5 text-cyan" /> {L(GUIDE_HEADERS.restart)}</h2>
        <ol className="space-y-3">
          {RESTART_PLAN.map((d, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-3 rounded-xl border p-3">
              <span className="shrink-0 rounded-lg bg-gradient-brand px-2.5 py-1 text-xs font-bold text-primary-foreground h-fit">{L(d.day)}</span>
              <p className="text-sm" dir="auto">{L(d.task)}</p>
            </motion.li>
          ))}
        </ol>
      </Card>

      <div>
        <h2 className="font-bold text-lg mb-3">{L(GUIDE_HEADERS.techniques)}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TECHNIQUES.map((tech, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${tech.color} 18%, transparent)`, color: tech.color }}>
                  <tech.icon className="size-4" />
                </span>
                <h3 className="font-bold">{L(tech.title)}</h3>
              </div>
              <p className="text-sm text-muted-foreground" dir="auto"><span className="font-semibold text-foreground">{L(GUIDE_HEADERS.why)}: </span>{L(tech.why)}</p>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">{L(GUIDE_HEADERS.how)}</div>
                <ol className="space-y-1.5">
                  {tech.steps.map((st, j) => (
                    <li key={j} className="flex gap-2 text-sm" dir="auto">
                      <span className="shrink-0 font-bold" style={{ color: tech.color }}>{j + 1}.</span>
                      <span>{L(st)}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="mt-auto flex gap-2 rounded-xl bg-muted p-3 text-xs" dir="auto">
                <Lightbulb className="size-4 shrink-0 text-flame" />
                <span><span className="font-bold">{L(GUIDE_HEADERS.tip)}: </span>{L(tech.tip)}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <Card>
        <h2 className="font-bold mb-4">{L(WEEKLY_PLAN.title)}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {WEEKLY_PLAN.rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2.5 pe-4 font-bold whitespace-nowrap text-cyan">{L(r.when)}</td>
                  <td className="py-2.5 text-muted-foreground" dir="auto">{L(r.what)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
