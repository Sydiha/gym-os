import type { FormEvent } from "react";
import type { Activity, Meal, Weight } from "../domain/types";
import { day, formatDate, formatTime, hasDuplicateMeal, localTime, uid } from "../domain/rules";
import { useDemo } from "../state/DemoContext";

type Props =
  | { kind: "meal"; editing?: Meal }
  | { kind: "activity"; editing?: Activity & { homeSession?: boolean } }
  | { kind: "weight"; editing?: Weight };

const messages: Record<string, string> = {
  name: "أدخل اسم الوجبة.",
  calories: "أدخل سعرات من صفر إلى ٦٠٠٠.",
  protein: "أدخل البروتين من صفر إلى ٥٠٠ غرام.",
  carbs: "أدخل الكربوهيدرات من صفر إلى ٨٠٠ غرام.",
  fat: "أدخل الدهون من صفر إلى ٥٠٠ غرام.",
  minutes: "أدخل مدة صحيحة أكبر من صفر وحتى ٦٠٠ دقيقة.",
  distance: "أدخل مسافة من صفر إلى ٥٠٠ كيلومتر، أو اتركها فارغة.",
  kg: "أدخل وزنًا من ٢٠ إلى ٤٠٠ كيلوغرام.",
  date: "اختر تاريخًا صحيحًا لا يتجاوز اليوم.",
  startTime: "أدخل وقت بدء صحيحًا أو اتركه فارغًا.",
};

function validField(input: HTMLInputElement) {
  const raw = input.value.trim();
  input.setCustomValidity("");
  let valid = input.checkValidity();
  if (input.name === "name" && raw.length === 0) valid = false;
  if (input.type === "number" && raw !== "") {
    const number = Number(raw);
    valid = valid && Number.isFinite(number);
  }
  if (input.name === "startTime" && raw !== "")
    valid = valid && /^([01]\d|2[0-3]):[0-5]\d$/.test(raw);
  input.setCustomValidity(valid ? "" : messages[input.name] ?? "تحقق من هذه القيمة.");
  return valid;
}

export function EntryForm(props: Props) {
  const { kind, editing } = props;
  const { data, update, setSheet, closeSheet } = useDemo();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = [...form.querySelectorAll<HTMLInputElement>("input")];
    const valid = fields.map(validField).every(Boolean);
    const nativeReport = form.reportValidity();
    if (!valid || !nativeReport) return;
    const f = new FormData(form);
    const raw = (key: string) => String(f.get(key) ?? "").trim();
    const value = (key: string) => Number(raw(key));

    if (kind === "meal") {
      const name = raw("name");
      const date = raw("date");
      const duplicate = hasDuplicateMeal(data, name, date, editing?.id);
      if (duplicate && !window.confirm("توجد وجبة بالاسم نفسه في هذا التاريخ. هل تريد تسجيلها مرة أخرى؟")) return;
      update((d) => {
        const meal: Meal = {
          id: editing?.id ?? uid(), name, date,
          calories: value("calories"), protein: value("protein"),
          carbs: value("carbs"), fat: value("fat"), source: raw("source"),
        };
        const index = d.meals.findIndex((item) => item.id === meal.id);
        if (index < 0) d.meals.push(meal); else d.meals[index] = meal;
      }, editing ? "عُدّلت الوجبة وأُعيد حساب المغذيات." : "سُجّلت الوجبة وتحدّثت السعرات والماكروز.");
    } else if (kind === "activity") {
      update((d) => {
        if (editing?.homeSession) {
          const session = d.homeSessions.find((item) => item.id === editing.id);
          if (session) { session.minutes = value("minutes"); session.date = raw("date"); }
        } else {
          const activity: Activity = {
            id: editing?.id ?? uid(), type: raw("type"), minutes: value("minutes"),
            distance: raw("distance") === "" ? null : value("distance"),
            date: raw("date"), startTime: raw("startTime") || undefined,
          };
          const index = d.activities.findIndex((item) => item.id === activity.id);
          if (index < 0) d.activities.push(activity); else d.activities[index] = activity;
        }
      }, editing ? "عُدّل النشاط وتحدّث التقدم." : "سُجّل النشاط وتحدّث التقدم الأسبوعي.");
    } else {
      update((d) => {
        const weight: Weight = { id: editing?.id ?? uid(), kg: value("kg"), date: raw("date") };
        const index = d.weights.findIndex((item) => item.id === weight.id);
        if (index < 0) d.weights.push(weight); else d.weights[index] = weight;
      }, editing ? "عُدّل قياس الوزن." : "سُجّل الوزن وتحدّث التقدم.");
    }
    closeSheet ? closeSheet() : setSheet(null);
  }

  const dateDefault = editing?.date ?? day();
  const timeDefault = kind === "activity" ? (editing ? editing.startTime ?? "" : localTime()) : "";
  return <>
    <h2>{editing ? "تعديل" : "تسجيل"} {kind === "meal" ? "وجبة" : kind === "activity" ? "نشاط" : "الوزن"}</h2>
    <p>{kind === "meal"
      ? "أدخل قيم الوجبة. الصفر مقبول عند انعدام القيمة؛ الأرقام غير الموثقة تقديرية."
      : kind === "activity"
        ? "سجّل نشاطًا أنجزته. المسافة اختيارية ويمكن أن تكون صفرًا؛ وقت البدء فقط."
        : "يمكن تسجيل قياس سابق؛ يُحدّد القياس الأحدث بحسب تاريخ القياس."}</p>
    <form noValidate onSubmit={submit}>
      {kind === "meal" ? <>
        <label>اسم الوجبة<input name="name" required maxLength={80} defaultValue={editing?.name} autoComplete="off" /></label>
        <label>السعرات (سعرة)<input name="calories" type="number" min="0" max="6000" step="any" required inputMode="decimal" defaultValue={editing?.calories} /></label>
        <div className="form-grid">
          <label>بروتين (غ)<input name="protein" type="number" min="0" max="500" step="any" defaultValue={editing?.protein ?? 0} required /></label>
          <label>كربوهيدرات (غ)<input name="carbs" type="number" min="0" max="800" step="any" defaultValue={editing?.carbs ?? 0} required /></label>
          <label>دهون (غ)<input name="fat" type="number" min="0" max="500" step="any" defaultValue={editing?.fat ?? 0} required /></label>
        </div>
        <label>تاريخ الوجبة<input lang="ar" name="date" type="date" defaultValue={dateDefault} max={day()} required /></label>
        <label>مصدر القيم<select name="source" defaultValue={editing?.source ?? "تقدير المستخدم، غير موثق"}>
          <option value="تقدير المستخدم، غير موثق">تقدير مني</option>
          <option value="من ملصق غذائي أدخله المستخدم؛ لم يتحقق التطبيق منه">نقلتها من ملصق غذائي</option>
          <option value="من قائمة المطعم أدخلها المستخدم؛ لم يتحقق التطبيق منها">نقلتها من قائمة المطعم</option>
          {editing?.source && !["تقدير المستخدم، غير موثق", "من ملصق غذائي أدخله المستخدم؛ لم يتحقق التطبيق منه", "من قائمة المطعم أدخلها المستخدم؛ لم يتحقق التطبيق منها"].includes(editing.source) && <option value={editing.source}>{editing.source}</option>}
        </select></label>
      </> : <>
        {kind === "activity" ? <>
          {editing?.homeSession ? <>
            <p className="note">هذا سجل جلسة منزلية مكتملة. يمكن تعديل مدتها وتاريخها فقط.</p>
            <label>المدة (دقيقة)<input name="minutes" type="number" min="1" max="600" step="1" required inputMode="numeric" defaultValue={editing.minutes} /></label>
          </> : <>
          <label>النشاط<select name="type" defaultValue={(editing as Activity | undefined)?.type ?? "مشي"}>
            {["مشي", "جري", "دراجة", ...((editing && !["مشي", "جري", "دراجة"].includes((editing as Activity).type)) ? [(editing as Activity).type] : [])].map((type) => <option key={type}>{type}</option>)}
          </select></label>
          <label>المدة (دقيقة)<input name="minutes" type="number" min="1" max="600" step="1" required inputMode="numeric" defaultValue={(editing as Activity | undefined)?.minutes} /></label>
          <label>المسافة بالكيلومتر (اختياري)<input name="distance" type="number" min="0" max="500" step="0.1" inputMode="decimal" defaultValue={(editing as Activity | undefined)?.distance ?? ""} /></label>
          <label>وقت بدء النشاط<input lang="ar" name="startTime" type="time" defaultValue={timeDefault} /></label>
          </>}
        </> : <label>الوزن بالكيلوغرام<input name="kg" type="number" min="20" max="400" step="0.1" inputMode="decimal" required defaultValue={(editing as Weight | undefined)?.kg} /></label>}
        <label>{kind === "activity" ? "تاريخ النشاط" : "تاريخ القياس"}<input lang="ar" name="date" type="date" defaultValue={dateDefault} max={day()} required /></label>
        {editing && <p className="note">التاريخ الحالي: {formatDate(editing.date)}{kind === "activity" ? ` · وقت البدء: ${formatTime((editing as Activity).startTime)}` : ""}</p>}
      </>}
      <button className="wide" type="submit">{editing ? "حفظ التعديل" : kind === "meal" ? "حفظ الوجبة" : kind === "activity" ? "حفظ النشاط" : "حفظ الوزن"}</button>
    </form>
  </>;
}
