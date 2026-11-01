import { BookOpen, FileCheck2 } from "lucide-react";
import type { Unit } from "@/lib/syllabus";
import { useT } from "@/lib/i18n";

const g = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;

/** Links to the official Algerian 3AS lessons and Bac exercises hosted on trusted school sites. */
export function LessonButton({ unit }: { unit: Unit; subject: string }) {
  const { t } = useT();
  const cls = "flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 px-2 py-1.5 text-xs font-medium hover:bg-muted";
  return (
    <div className="mb-1 flex gap-2">
      <a href={g(`درس ${unit.ar} 3 ثانوي site:eddirasa.com`)} target="_blank" rel="noreferrer" className={cls}><BookOpen className="size-3.5 text-cyan" /> {t("Official lesson")}</a>
      <a href={g(`تمارين بكالوريا ${unit.ar} site:dzexams.com`)} target="_blank" rel="noreferrer" className={cls}><FileCheck2 className="size-3.5 text-violet" /> {t("Official exercises")}</a>
    </div>
  );
}
