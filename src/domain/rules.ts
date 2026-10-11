import type { DemoData, Nutrient, Settings } from "./types";
export const fmt = (n: number) =>
  new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 1 }).format(n);
export function day(offset = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
export const week = () => Array.from({ length: 7 }, (_, i) => day(i - 6));
export const uid = () => `${Date.now()}-${crypto.randomUUID()}`;
export const allActivities = (data: DemoData) => [
  ...data.activities,
  ...data.homeSessions.map((s) => ({ ...s, type: "منزلي", distance: null })),
];
export const weekly = (data: DemoData) =>
  allActivities(data).filter((a) => week().includes(a.date));
export const weeklyDays = (data: DemoData) =>
  new Set(weekly(data).map((a) => a.date)).size;
export const weeklyMinutes = (data: DemoData) =>
  weekly(data).reduce((n, a) => n + a.minutes, 0);
export const todayMeals = (data: DemoData) =>
  data.meals.filter((m) => m.date === day());
export const nutrient = (data: DemoData, key: Nutrient) =>
  todayMeals(data).reduce((n, m) => n + m[key], 0);
export const latestWeight = (data: DemoData) =>
  [...data.weights].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
  )[0];
const minutes = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
export function eligible(data: DemoData, time: string) {
  if (
    !data.settings.homeSuggestions ||
    data.settings.dayType === "rest" ||
    data.declinedDate === day() ||
    data.homeSessions.some((s) => s.date === day()) ||
    data.activities.some((a) => a.date === day())
  )
    return false;
  return data.settings.expected === "none"
    ? minutes(time) >= 1200
    : minutes(time) > minutes(data.settings.expected);
}
export const earnedMinutes = (duration: number, skipped: number[]) =>
  Math.max(0, duration - new Set(skipped).size);
export function moveSet(s: Settings) {
  const reps =
    s.level === "متقدم" ? "١٠–١٢" : s.level === "متوسط" ? "٨–١٠" : "٦–٨";
  return [
    {
      name: s.knee ? "مشي خفيف أثناء الجلوس" : "مشي هادئ في المكان",
      dose: "٦٠ ثانية",
      detail: "ابدأ ببطء وبإيقاع مريح، دون حبس النفس.",
    },
    {
      name: s.knee ? "مدّ الساق أثناء الجلوس" : "قيام وجلوس من كرسي ثابت",
      dose: reps + " مرات أو ٦٠ ثانية",
      detail: s.knee
        ? "مدّ الساق ضمن مدى مريح دون ألم."
        : "ثبّت الكرسي، وانهض ببطء ثم اجلس بتحكم. استخدم اليدين للدعم.",
    },
    {
      name: s.shoulder
        ? s.knee
          ? "فتح وإغلاق الكفين أثناء الجلوس"
          : "خطوات جانبية هادئة"
        : "ضغط خفيف على الحائط",
      dose: reps + " مرات أو ٦٠ ثانية",
      detail:
        s.shoulder && s.knee
          ? "أرح الذراعين على الفخذين وافتح الكفين وأغلقهما برفق."
          : s.shoulder
            ? "تحرك بخطوات قصيرة، واستند عند الحاجة."
            : "ضع الكفين على حائط ثابت واثنِ المرفقين برفق دون إجهاد.",
    },
    {
      name: s.knee
        ? s.shoulder
          ? "تحريك الكاحلين أثناء الجلوس"
          : "حركة الذراعين أثناء الجلوس"
        : "خطوات جانبية هادئة",
      dose: "٦٠ ثانية",
      detail:
        s.knee && s.shoulder
          ? "حرّك القدمين بمدى مريح والكتفان مسترخيان."
          : s.knee
            ? "حرّك الذراعين ضمن مدى مريح دون رفع الكتفين."
            : "تحرك دون قفز أو تسارع. استند إلى كرسي ثابت إذا لزم.",
    },
    {
      name: "تهدئة وتنفس",
      dose: "٦٠ ثانية",
      detail: "أبطئ الحركة وتنفّس بشكل طبيعي. توقف إذا شعرت بدوار.",
    },
  ];
}

export const moves = (settings: Settings, duration: number) =>
  Array.from({ length: duration / 5 }, () => moveSet(settings)).flat();
