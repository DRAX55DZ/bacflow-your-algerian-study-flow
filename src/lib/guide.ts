import type { LucideIcon } from "lucide-react";
import { Rocket, Brain, Repeat2, MessageSquareQuestion, FileText, PhoneOff, Moon, CalendarCheck, NotebookPen, Target } from "lucide-react";

export type Bi = { en: string; ar: string };

export interface Technique {
  icon: LucideIcon;
  color: string;
  title: Bi;
  why: Bi;
  steps: Bi[];
  tip: Bi;
}

export const GUIDE_INTRO: Bi = {
  en: "No student is hopeless. The Bac is not about being smart — it is about using the right method, a little every day. Start here, even if you feel completely lost.",
  ar: "لا يوجد طالب ميؤوس منه. البكالوريا ليست مسألة ذكاء — بل طريقة صحيحة وقليل من الجهد كل يوم. ابدأ من هنا حتى لو كنت تشعر أنك ضائع تماما.",
};

export const RESTART_PLAN: { day: Bi; task: Bi }[] = [
  { day: { en: "Day 1", ar: "اليوم 1" }, task: { en: "Pick your 3 highest-coefficient subjects. For each, write down the units you know nothing about. No studying yet — just the honest list.", ar: "اختر موادك الثلاث ذات المعامل الأعلى. لكل مادة، اكتب الوحدات التي لا تعرف عنها شيئا. لا مراجعة بعد — فقط القائمة الصادقة." } },
  { day: { en: "Day 2", ar: "اليوم 2" }, task: { en: "Take the FIRST unit of your weakest subject. Read the lesson summary once, slowly. Write 3 formulas or definitions in your log.", ar: "خذ أول وحدة من أضعف مادة لديك. اقرأ ملخص الدرس مرة واحدة ببطء. دوّن 3 قوانين أو تعريفات في سجلك." } },
  { day: { en: "Day 3", ar: "اليوم 3" }, task: { en: "Do the EASY exercises of that unit only. It's fine to look at the solution, then redo it alone without looking.", ar: "حل التمارين السهلة فقط من تلك الوحدة. لا بأس أن ترى الحل، ثم أعد حله وحدك دون النظر." } },
  { day: { en: "Day 4", ar: "اليوم 4" }, task: { en: "Explain the lesson out loud, in your own words, as if teaching a friend. Wherever you get stuck — that's what you review tonight.", ar: "اشرح الدرس بصوت عالٍ بكلماتك كأنك تشرح لصديق. كل موضع تتعثر فيه — هذا ما تراجعه الليلة." } },
  { day: { en: "Day 5", ar: "اليوم 5" }, task: { en: "Do one 25-minute focus session per subject (3 total). Phone in another room. Small, but non-negotiable.", ar: "نفذ جلسة تركيز 25 دقيقة لكل مادة (3 في المجموع). الهاتف في غرفة أخرى. قليل، لكن غير قابل للتفاوض." } },
  { day: { en: "Day 6", ar: "اليوم 6" }, task: { en: "Try one past Bac exercise on the unit you studied. Don't panic if you fail — write every mistake in your mistake log.", ar: "جرب تمرينا واحدا من بكالوريا سابقة في الوحدة التي درستها. لا تهلع إذا فشلت — دوّن كل خطأ في سجل الأخطاء." } },
  { day: { en: "Day 7", ar: "اليوم 7" }, task: { en: "Rest half the day. Then re-do ONLY the exercises you got wrong this week. Wrong answers are your real teacher.", ar: "ارتَح نصف اليوم. ثم أعد حل التمارين التي أخطأت فيها هذا الأسبوع فقط. الأخطاء هي معلمك الحقيقي." } },
];

export const TECHNIQUES: Technique[] = [
  {
    icon: Brain, color: "var(--cyan)",
    title: { en: "Active recall", ar: "الاستدعاء النشط" },
    why: { en: "Re-reading feels productive but your brain learns almost nothing. Testing yourself is 3x more effective.", ar: "إعادة القراءة تبدو مفيدة لكن عقلك لا يتعلم شيئا تقريبا. اختبار نفسك أكثر فعالية 3 مرات." },
    steps: [
      { en: "Read the lesson once, then CLOSE the book.", ar: "اقرأ الدرس مرة واحدة، ثم أغلق الكتاب." },
      { en: "Write everything you remember on a blank page.", ar: "اكتب كل ما تتذكره في ورقة بيضاء." },
      { en: "Open the book and check what you missed — that's your real weakness.", ar: "افتح الكتاب وتحقق مما فاتك — هذا هو ضعفك الحقيقي." },
    ],
    tip: { en: "Use this after every lesson in the Syllabus tab before ticking it.", ar: "استخدمها بعد كل درس في تبويب المنهاج قبل تأشيره." },
  },
  {
    icon: Repeat2, color: "var(--violet)",
    title: { en: "Spaced repetition", ar: "التكرار المتباعد" },
    why: { en: "You forget 70% of a lesson within 24 hours unless you review it at the right moments.", ar: "تنسى 70% من الدرس خلال 24 ساعة إلا إذا راجعته في اللحظات الصحيحة." },
    steps: [
      { en: "Review a lesson the same day you study it (10 min).", ar: "راجع الدرس في نفس يوم دراسته (10 دقائق)." },
      { en: "Review again after 3 days, then after 1 week, then after 1 month.", ar: "راجع مرة أخرى بعد 3 أيام، ثم بعد أسبوع، ثم بعد شهر." },
      { en: "Each review is short — you're just refreshing, not re-learning.", ar: "كل مراجعة قصيرة — أنت فقط تنشّط الذاكرة، لا تتعلم من جديد." },
    ],
    tip: { en: "Add old units to your daily targets so reviews appear automatically.", ar: "أضف الوحدات القديمة إلى أهدافك اليومية لتظهر المراجعات تلقائيا." },
  },
  {
    icon: MessageSquareQuestion, color: "var(--mint)",
    title: { en: "The Feynman technique", ar: "تقنية فاينمان" },
    why: { en: "If you can't explain it simply, you don't understand it yet. This exposes fake knowledge instantly.", ar: "إذا لم تستطع شرحه ببساطة، فأنت لم تفهمه بعد. هذه الطريقة تكشف المعرفة الوهمية فورا." },
    steps: [
      { en: "Pick one concept (e.g. logarithms, acids and bases).", ar: "اختر مفهوما واحدا (مثلا: اللوغاريتمات، الأحماض والأسس)." },
      { en: "Explain it out loud like you're teaching a 12-year-old.", ar: "اشرحه بصوت عالٍ كأنك تعلّم طفلا في الثانية عشرة." },
      { en: "Every place you hesitate or use vague words = go back to the lesson.", ar: "كل موضع تتردد فيه أو تستخدم كلمات غامضة = عد إلى الدرس." },
    ],
    tip: { en: "Do it with a friend from the Friends tab — teaching each other is double points.", ar: "افعلها مع صديق من تبويب الأصدقاء — تعليم بعضكما نقاط مضاعفة." },
  },
  {
    icon: FileText, color: "var(--flame)",
    title: { en: "Past papers first", ar: "مواضيع البكالوريا أولا" },
    why: { en: "The Bac repeats itself. The same exercise types come back year after year with different numbers.", ar: "البكالوريا يكرر نفسه. نفس أنواع التمارين تعود سنة بعد سنة بأرقام مختلفة." },
    steps: [
      { en: "After finishing a unit, immediately do its past Bac exercises.", ar: "بعد إنهاء وحدة، حل فورا تمارين البكالوريا الخاصة بها." },
      { en: "Time yourself like the real exam — no phone, no notes.", ar: "اضبط الوقت كأنك في الامتحان الحقيقي — لا هاتف، لا ملاحظات." },
      { en: "Correct yourself with the official marking scheme, harshly.", ar: "صحح لنفسك بسلم التنقيط الرسمي، بصرامة." },
    ],
    tip: { en: "From February onwards, one full past paper per week minimum.", ar: "ابتداء من فيفري، موضوع كامل واحد في الأسبوع على الأقل." },
  },
  {
    icon: PhoneOff, color: "var(--cyan)",
    title: { en: "Phone discipline", ar: "انضباط الهاتف" },
    why: { en: "One notification costs you 20 minutes of deep focus. 'Studying with the phone next to you' is not studying.", ar: "إشعار واحد يكلفك 20 دقيقة من التركيز العميق. «المراجعة والهاتف بجانبك» ليست مراجعة." },
    steps: [
      { en: "Put the phone in another room during focus sessions — not silent, not face-down, ANOTHER ROOM.", ar: "ضع الهاتف في غرفة أخرى أثناء جلسات التركيز — ليس صامتا، ليس مقلوبا، غرفة أخرى." },
      { en: "Use the Focus timer here as your only allowed screen.", ar: "استخدم مؤقت التركيز هنا كشاشتك الوحيدة المسموحة." },
      { en: "Reward yourself with phone time during breaks, not during work.", ar: "كافئ نفسك بوقت الهاتف أثناء الاستراحات، لا أثناء العمل." },
    ],
    tip: { en: "If you study 3 focused hours phone-free, you beat 8 distracted hours.", ar: "إذا درست 3 ساعات مركزة بدون هاتف، فأنت تتفوق على 8 ساعات مشتتة." },
  },
  {
    icon: Moon, color: "var(--violet)",
    title: { en: "Sleep is studying", ar: "النوم جزء من المراجعة" },
    why: { en: "Your brain moves lessons to long-term memory while you sleep. All-nighters delete what you studied.", ar: "عقلك ينقل الدروس إلى الذاكرة طويلة المدى أثناء النوم. السهر يمحو ما درسته." },
    steps: [
      { en: "7–8 hours, non-negotiable, especially the night before an exam.", ar: "7–8 ساعات، غير قابلة للتفاوض، خاصة ليلة الامتحان." },
      { en: "Review formulas for 10 minutes right before sleeping — they stick better.", ar: "راجع القوانين 10 دقائق قبل النوم مباشرة — تثبت بشكل أفضل." },
      { en: "Never trade sleep for cramming. A tired brain scores half.", ar: "لا تستبدل النوم بالحشو أبدا. العقل المتعب يسجل النصف." },
    ],
    tip: { en: "Same sleep time every night — your brain loves rhythm.", ar: "نفس وقت النوم كل ليلة — عقلك يحب الإيقاع." },
  },
  {
    icon: NotebookPen, color: "var(--mint)",
    title: { en: "The mistake log", ar: "سجل الأخطاء" },
    why: { en: "Top students don't make fewer mistakes — they never make the same one twice.", ar: "المتفوقون لا يخطئون أقل — بل لا يكررون نفس الخطأ مرتين." },
    steps: [
      { en: "Every wrong exercise: write WHAT you got wrong and WHY.", ar: "كل تمرين خاطئ: اكتب ما الذي أخطأت فيه ولماذا." },
      { en: "Review the log every Sunday — 15 minutes.", ar: "راجع السجل كل أحد — 15 دقيقة." },
      { en: "Before any exam, read your mistake log first. It's your personal cheat sheet.", ar: "قبل أي امتحان، اقرأ سجل أخطائك أولا. إنه ملخصك الشخصي." },
    ],
    tip: { en: "Use the notebook icon at the top of this app — it was built exactly for this.", ar: "استخدم أيقونة الدفتر أعلى هذا التطبيق — صُممت لهذا بالضبط." },
  },
  {
    icon: Target, color: "var(--flame)",
    title: { en: "Coefficients = priorities", ar: "المعاملات = الأولويات" },
    why: { en: "A point in math (coef 7) is worth more than three points in a coef-2 subject. Study where the points are.", ar: "نقطة في الرياضيات (معامل 7) تساوي أكثر من ثلاث نقاط في مادة بمعامل 2. راجع حيث توجد النقاط." },
    steps: [
      { en: "Give 60% of your time to your 3 highest-coefficient subjects.", ar: "امنح 60% من وقتك لموادك الثلاث ذات المعامل الأعلى." },
      { en: "Never fully abandon a low-coef subject — a 4/20 hurts everywhere.", ar: "لا تهجر مادة ضعيفة المعامل تماما — 4/20 تؤذي في كل مكان." },
      { en: "Check the coefficient column in your Dashboard table weekly.", ar: "تحقق من عمود المعامل في جدول لوحتك أسبوعيا." },
    ],
    tip: { en: "The overall % on your Dashboard already weights subjects by coefficient — trust it.", ar: "النسبة الإجمالية في لوحتك توزن المواد حسب المعامل — ثق بها." },
  },
];

export const WEEKLY_PLAN: { title: Bi; rows: { when: Bi; what: Bi }[] } = {
  title: { en: "A realistic weekly rhythm", ar: "إيقاع أسبوعي واقعي" },
  rows: [
    { when: { en: "Mon–Thu", ar: "الاثنين–الخميس" }, what: { en: "2 focus sessions after school: one high-coeff subject, one weak subject. 10-min review before sleep.", ar: "جلستا تركيز بعد الدراسة: مادة عالية المعامل، ومادة ضعيفة. مراجعة 10 دقائق قبل النوم." } },
    { when: { en: "Friday", ar: "الجمعة" }, what: { en: "Rest in the morning. One full past paper in the afternoon, corrected harshly.", ar: "راحة في الصباح. موضوع بكالوريا كامل بعد الظهر، مصحح بصرامة." } },
    { when: { en: "Saturday", ar: "السبت" }, what: { en: "Fix every mistake from the week (mistake log). Plan next week's units.", ar: "صحح كل أخطاء الأسبوع (سجل الأخطاء). خطط وحدات الأسبوع القادم." } },
    { when: { en: "Sunday", ar: "الأحد" }, what: { en: "Light review only: summaries and formulas. Sleep early.", ar: "مراجعة خفيفة فقط: الملخصات والقوانين. نم مبكرا." } },
  ],
};

export const GUIDE_HEADERS = {
  restart: { en: "The 7-day restart (start here if you're far behind)", ar: "خطة الـ 7 أيام للانطلاق (ابدأ هنا إذا كنت متأخرا جدا)" } as Bi,
  techniques: { en: "Techniques that actually work", ar: "تقنيات تعمل فعلا" } as Bi,
  why: { en: "Why it works", ar: "لماذا تعمل" } as Bi,
  how: { en: "How to do it", ar: "كيف تفعلها" } as Bi,
  tip: { en: "Pro tip", ar: "نصيحة ذهبية" } as Bi,
  nav: { en: "Study Guide", ar: "دليل المراجعة" } as Bi,
  title: { en: "How to study — from zero to Bac-ready", ar: "كيف تراجع — من الصفر إلى جاهز للبكالوريا" } as Bi,
};
