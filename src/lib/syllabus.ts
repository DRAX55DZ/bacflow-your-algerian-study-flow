export type Stream = "sci" | "math";
export type ItemKind = "lesson" | "exercise" | "summary" | "bac";
export interface Item { id: string; kind: ItemKind; title: string }
export interface Unit { id: string; title: string; ar: string; items: Item[] }
export interface Subject { id: string; en: string; ar: string; color: string; units: Unit[] }

const unitNames: Record<string, [string, string][]> = {
  nat: [["Protein synthesis", "تركيب البروتين"], ["Enzymes", "الإنزيمات"], ["Immunity", "المناعة"], ["Nerve communication", "الاتصال العصبي"], ["Photosynthesis", "التركيب الضوئي"]],
  phy: [["Chemical kinetics", "المتابعة الزمنية"], ["Radioactivity", "النشاط الإشعاعي"], ["Electrical circuits RC/RL", "الدارات الكهربائية"], ["Mechanics", "الميكانيك"], ["Acid-base equilibrium", "التوازن الكيميائي"]],
  math: [["Sequences", "المتتاليات"], ["Limits & continuity", "النهايات والاستمرارية"], ["Exponential & log", "الدوال الأسية واللوغاريتمية"], ["Integrals", "التكامل"], ["Complex numbers", "الأعداد المركبة"], ["Probability", "الاحتمالات"]],
  ar: [["Poetry analysis", "تحليل النصوص الشعرية"], ["Grammar", "القواعد"], ["Rhetoric", "البلاغة"]],
  hg: [["Cold War", "الحرب الباردة"], ["Algerian revolution", "الثورة الجزائرية"], ["World economy", "الاقتصاد العالمي"]],
  fr: [["Historical text", "النص التاريخي"], ["Debate", "المناظرة"], ["Appeal", "النداء"]],
  en: [["Ethics in business", "أخلاقيات العمل"], ["Safety first", "السلامة أولا"], ["Astronomy", "علم الفلك"]],
  isl: [["Faith & reason", "العقيدة والعقل"], ["Family in Islam", "الأسرة في الإسلام"], ["Economic ethics", "المعاملات المالية"]],
  phi: [["Problem & questioning", "السؤال والمشكلة"], ["Memory & imagination", "الذاكرة والخيال"], ["Truth & mathematics", "الحقيقة والرياضيات"]],
};

const base: Omit<Subject, "units">[] = [
  { id: "nat", en: "Natural Sciences", ar: "علوم الطبيعة والحياة", color: "var(--mint)" },
  { id: "phy", en: "Physics & Chemistry", ar: "العلوم الفيزيائية", color: "var(--cyan)" },
  { id: "math", en: "Mathematics", ar: "الرياضيات", color: "var(--violet)" },
  { id: "ar", en: "Arabic", ar: "اللغة العربية", color: "var(--flame)" },
  { id: "hg", en: "History & Geography", ar: "التاريخ والجغرافيا", color: "var(--flame)" },
  { id: "fr", en: "French", ar: "الفرنسية", color: "var(--cyan)" },
  { id: "en", en: "English", ar: "الإنكليزية", color: "var(--mint)" },
  { id: "isl", en: "Islamic Studies", ar: "التربية الإسلامية", color: "var(--mint)" },
  { id: "phi", en: "Philosophy", ar: "الفلسفة", color: "var(--violet)" },
];

export const SUBJECTS: Subject[] = base.map((s) => ({
  ...s,
  units: (unitNames[s.id] ?? []).map(([en, ar], i) => {
    const uid = `${s.id}-u${i + 1}`;
    return {
      id: uid, title: en, ar,
      items: [
        { id: `${uid}-l`, kind: "lesson", title: "Lesson" },
        { id: `${uid}-e1`, kind: "exercise", title: "Exercise set 1" },
        { id: `${uid}-e2`, kind: "exercise", title: "Exercise set 2" },
        { id: `${uid}-s`, kind: "summary", title: "Summary" },
        { id: `${uid}-b`, kind: "bac", title: "Past Bac topics" },
      ],
    };
  }),
}));

export const COEFFS: Record<Stream, Record<string, number>> = {
  sci: { nat: 6, phy: 5, math: 5, ar: 3, hg: 2, fr: 2, en: 2, isl: 2, phi: 2 },
  math: { math: 7, phy: 6, nat: 2, ar: 3, hg: 2, fr: 2, en: 2, isl: 2, phi: 2 },
};

export const STREAM_LABEL: Record<Stream, { en: string; ar: string }> = {
  sci: { en: "Experimental Sciences", ar: "علوم تجريبية" },
  math: { en: "Mathematics", ar: "رياضيات" },
};

export function subjectPct(s: Subject, done: Record<string, boolean>) {
  const all = s.units.flatMap((u) => u.items);
  return all.length ? (all.filter((i) => done[i.id]).length / all.length) * 100 : 0;
}

/** Overall Bac completion weighted by the stream's official coefficients. */
export function overallPct(stream: Stream, done: Record<string, boolean>) {
  const c = COEFFS[stream];
  let w = 0, t = 0;
  for (const s of SUBJECTS) { w += c[s.id] ?? 0; t += (c[s.id] ?? 0) * subjectPct(s, done); }
  return w ? t / w : 0;
}

export const sortedSubjects = (stream: Stream) =>
  [...SUBJECTS].sort((a, b) => (COEFFS[stream][b.id] ?? 0) - (COEFFS[stream][a.id] ?? 0));
