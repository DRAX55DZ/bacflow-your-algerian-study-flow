export type Stream = "sci" | "math";
export type ItemKind = "lesson" | "exercise" | "summary" | "bac";
export type Difficulty = "easy" | "medium" | "hard";
export interface Item { id: string; kind: ItemKind; title: string; difficulty?: Difficulty }
export interface Unit { id: string; title: string; ar: string; items: Item[] }
export interface Subject { id: string; en: string; ar: string; color: string; units: Unit[]; papers: Item[] }

export const BAC_YEARS = Array.from({ length: 2026 - 2008 + 1 }, (_, i) => 2026 - i);

const MATH_SHARED: [string, string][] = [
  ["Numerical Functions & Limits", "الدوال العددية والإشتقاقية"],
  ["Exponential & Logarithmic Functions", "الدوال الأسية واللوغاريتمية"],
  ["Numerical Sequences", "المتتاليات العددية"],
  ["Complex Numbers", "الأعداد المركبة"],
  ["Probability & Combinatorics", "الاحتمالات"],
  ["Space Geometry", "الهندسة في الفضاء"],
];
const MATH_EXTRA: [string, string][] = [
  ["Arithmetic in Z & Congruence", "الحساب في Z والترديدات"],
  ["Similarities & Direct Transformations", "التشابه المباشر"],
];

const unitNames: Record<string, [string, string][]> = {
  nat: [
    ["Protein Synthesis", "التركيب البروتيني"],
    ["Functional Specialization of Proteins", "العلاقة بين بنية ووظيفة البروتين"],
    ["Enzymatic Activity", "النشاط الإنزيمي للبروتينات"],
    ["Immunology / Self-Defense", "دور البروتينات في الدفاع عن الذات"],
    ["Nerve Signal Transmission", "دور البروتينات في الاتصال العصبي"],
    ["Photosynthesis & Energy Conversion", "التحويل الضوئي للطاقة"],
  ],
  phy: [
    ["Kinetic Follow-up of Chemical Reactions", "المتابعة الزمنية لتحول كيميائي"],
    ["Nuclear Transformations", "التحولات النووية"],
    ["Electrical Dipoles RC & RL", "الظواهر الكهربائية"],
    ["Chemical Equilibrium & Acid-Base Reactions", "تطور جملة كيميائية نحو حالة التوازن"],
    ["Classical Mechanics", "تطور جملة ميكانيكية"],
  ],
  math: MATH_SHARED,
  ar: [["Poetry analysis", "تحليل النصوص الشعرية"], ["Grammar", "القواعد"], ["Rhetoric", "البلاغة"]],
  hg: [["Cold War", "الحرب الباردة"], ["Algerian revolution", "الثورة الجزائرية"], ["World economy", "الاقتصاد العالمي"]],
  fr: [["Historical text", "النص التاريخي"], ["Debate", "المناظرة"], ["Appeal", "النداء"]],
  en: [["Ethics in business", "أخلاقيات العمل"], ["Safety first", "السلامة أولا"], ["Astronomy", "علم الفلك"]],
  isl: [["Faith & reason", "العقيدة والعقل"], ["Family in Islam", "الأسرة في الإسلام"], ["Economic ethics", "المعاملات المالية"]],
  phi: [["Problem & questioning", "السؤال والمشكلة"], ["Memory & imagination", "الذاكرة والخيال"], ["Truth & mathematics", "الحقيقة والرياضيات"]],
};

const base: Omit<Subject, "units" | "papers">[] = [
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

function build(stream: Stream): Subject[] {
  return base.map((s) => {
    const names = s.id === "math" && stream === "math" ? [...MATH_SHARED, ...MATH_EXTRA] : unitNames[s.id] ?? [];
    return {
      ...s,
      units: names.map(([en, ar], i) => {
        const uid = `${s.id}-u${i + 1}`;
        return {
          id: uid, title: en, ar,
          items: [
            { id: `${uid}-l`, kind: "lesson", title: "Lesson" },
            { id: `${uid}-s`, kind: "summary", title: "Summary" },
            { id: `${uid}-e1`, kind: "exercise", title: "Exercises", difficulty: "easy" },
            { id: `${uid}-e2`, kind: "exercise", title: "Exercises", difficulty: "medium" },
            { id: `${uid}-e3`, kind: "exercise", title: "Exercises", difficulty: "hard" },
          ],
        };
      }),
      papers: BAC_YEARS.map((y) => ({ id: `${s.id}-${stream}-bac-${y}`, kind: "bac", title: `Bac ${y}` })),
    };
  });
}

const CACHE: Record<Stream, Subject[]> = { sci: build("sci"), math: build("math") };
export const subjectsFor = (stream: Stream) => CACHE[stream];
/** Science-stream view (kept for compatibility). */
export const SUBJECTS = CACHE.sci;

export const COEFFS: Record<Stream, Record<string, number>> = {
  sci: { nat: 6, phy: 5, math: 5, ar: 3, hg: 2, fr: 2, en: 2, isl: 2, phi: 2 },
  math: { math: 7, phy: 6, nat: 2, ar: 3, hg: 2, fr: 2, en: 2, isl: 2, phi: 2 },
};

export const STREAM_LABEL: Record<Stream, { en: string; ar: string }> = {
  sci: { en: "Experimental Sciences", ar: "علوم تجريبية" },
  math: { en: "Mathematics", ar: "رياضيات" },
};

export const allItems = (s: Subject) => [...s.units.flatMap((u) => u.items), ...s.papers];

export function subjectPct(s: Subject, done: Record<string, boolean>) {
  const all = allItems(s);
  return all.length ? (all.filter((i) => done[i.id]).length / all.length) * 100 : 0;
}

/** Overall Bac completion weighted by the stream's official coefficients. */
export function overallPct(stream: Stream, done: Record<string, boolean>) {
  const c = COEFFS[stream];
  let w = 0, t = 0;
  for (const s of subjectsFor(stream)) { w += c[s.id] ?? 0; t += (c[s.id] ?? 0) * subjectPct(s, done); }
  return w ? t / w : 0;
}

export const sortedSubjects = (stream: Stream) =>
  [...subjectsFor(stream)].sort((a, b) => (COEFFS[stream][b.id] ?? 0) - (COEFFS[stream][a.id] ?? 0));

export function itemLabel(id: string): string {
  for (const st of ["sci", "math"] as Stream[]) for (const s of CACHE[st]) {
    const p = s.papers.find((x) => x.id === id); if (p) return `${s.en} · ${p.title}`;
    for (const u of s.units) { const it = u.items.find((x) => x.id === id); if (it) return `${u.title} · ${it.title}${it.difficulty ? ` (${it.difficulty})` : ""}`; }
  }
  return "a task";
}
