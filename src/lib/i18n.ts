import { useAppState, type Lang } from "./store";

const AR = {
  Dashboard: "الرئيسية", Syllabus: "المنهاج", Friends: "الأصدقاء", Chat: "الدردشة", Focus: "التركيز", Settings: "الإعدادات",
  "Sign out": "تسجيل الخروج", "Formula & mistake log": "سجل القوانين والأخطاء", "Formula & Mistake Log": "سجل القوانين والأخطاء",
  formula: "قانون", definition: "تعريف", mistake: "خطأ", Add: "إضافة",
  "Nothing yet — capture formulas and tricky mistakes as you study.": "لا شيء بعد — دوّن القوانين والأخطاء أثناء المراجعة.",
  "Overall Bac completion": "نسبة التحضير الإجمالية", "Continue studying →": "← واصل المراجعة",
  day: "يوم", days: "أيام", "Study streak": "سلسلة الأيام", "Countdown to Bac · June 2027": "العد التنازلي للبكالوريا · جوان 2027",
  hrs: "ساعة", min: "دقيقة", sec: "ثانية", "Today's targets": "أهداف اليوم", "Add a goal…": "أضف هدفا…",
  "Study consistency": "خريطة المراجعة", Subjects: "المواد", Subject: "المادة", Coeff: "المعامل", Progress: "التقدم",
  "Past Bac papers": "مواضيع البكالوريا", "Share to group chat": "مشاركة في الدردشة", Lesson: "الدرس", Summary: "الملخص",
  Exercises: "تمارين", easy: "سهل", medium: "متوسط", hard: "صعب", lesson: "درس", summary: "ملخص", exercise: "تمرين", quiz: "اختبار", bac: "بكالوريا",
  "Take the unit quiz": "اجتز اختبار الوحدة", "Quiz passed · retake": "تم النجاح · أعد الاختبار", quizTitle: "اختبار",
  "Get 4/5 to mark this unit's quiz as done.": "احصل على 4/5 لإتمام اختبار هذه الوحدة.", Retry: "إعادة",
  "Writing your questions…": "جارٍ إعداد الأسئلة…", "Submit answers": "إرسال الإجابات", "Passed!": "نجحت!",
  "Not yet, review the lesson and retry.": "ليس بعد، راجع الدرس وأعد المحاولة.", "New quiz": "اختبار جديد",
  "Official lesson": "الدرس الرسمي", "Writing the lesson…": "جارٍ كتابة الدرس…",
  "Follows the official Algerian Bac program. Written by AI — check with your teacher.": "وفق المنهاج الرسمي للبكالوريا الجزائرية. مكتوب بالذكاء الاصطناعي — تحقق مع أستاذك.",
  Theme: "المظهر", "Saved to your account and synced across devices.": "يُحفظ في حسابك ويتزامن بين أجهزتك.",
  Language: "اللغة", "Choose the language of the whole app.": "اختر لغة التطبيق بالكامل.",
  "Your invite code": "رمز الدعوة الخاص بك", "Share it so friends can add you.": "شاركه ليضيفك أصدقاؤك.",
  "Add a friend": "إضافة صديق", Leaderboard: "لوحة الصدارة", "No other students yet — invite your classmates!": "لا يوجد طلاب آخرون بعد — ادعُ زملاءك!",
  Nudge: "تنبيه", you: "أنت", "Invite code copied": "تم نسخ رمز الدعوة",
  "Focus · تركيز": "تركيز", "Break · استراحة": "استراحة", Start: "ابدأ", Pause: "إيقاف", Reset: "إعادة",
  "Focus (min)": "التركيز (دقيقة)", "Break (min)": "الاستراحة (دقيقة)",
  "Tip: open the notebook icon at the top to log formulas and mistakes mid-session.": "نصيحة: افتح أيقونة الدفتر في الأعلى لتدوين القوانين والأخطاء.",
  "Add friends to see their messages.": "أضف أصدقاء لترى رسائلهم.", "No messages yet — say hi 👋": "لا توجد رسائل بعد — قل مرحبا 👋",
  "Message… (**bold**, _italic_)": "رسالة… (**عريض**، _مائل_)", "Experimental Sciences": "علوم تجريبية", Mathematics: "رياضيات",
  "Group study": "مجموعة المراجعة", "Type a message…": "اكتب رسالة…", Send: "إرسال",
} as const;

export type Key = keyof typeof AR;
export const tr = (lang: Lang, k: Key | string) => (lang === "ar" ? (AR as Record<string, string>)[k] ?? k : k);
export function useT() {
  const { lang } = useAppState();
  return { lang, t: (k: Key | string) => tr(lang, k) };
}
