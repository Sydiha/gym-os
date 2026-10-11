import type { FormEvent } from "react";
import { useDemo } from "../state/DemoContext";
import { day, uid } from "../domain/rules";
export function EntryForm({ kind }: { kind: "meal" | "activity" | "weight" }) {
  const { update, setSheet } = useDemo();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const f = new FormData(event.currentTarget),
      value = (key: string) => Number(f.get(key));
    update(
      (d) => {
        if (kind === "meal")
          d.meals.push({
            id: uid(),
            name: String(f.get("name")).trim(),
            calories: value("calories"),
            protein: value("protein"),
            carbs: value("carbs"),
            fat: value("fat"),
            source: String(f.get("source")),
            date: day(),
          });
        else if (kind === "activity")
          d.activities.push({
            id: uid(),
            type: String(f.get("type")),
            minutes: value("minutes"),
            distance: f.get("distance") === "" ? null : value("distance"),
            date: String(f.get("date")),
          });
        else
          d.weights.push({
            id: uid(),
            kg: value("kg"),
            date: String(f.get("date")),
          });
      },
      kind === "meal"
        ? "سُجّلت الوجبة وتحدّثت السعرات والماكروز."
        : kind === "activity"
          ? "سُجّل النشاط وتحدّث التقدم الأسبوعي."
          : "سُجّل الوزن وتحدّث التقدم.",
    );
    setSheet(null);
  }
  if (kind === "meal")
    return (
      <>
        <h2>تسجيل وجبة</h2>
        <p>
          أدخل قيم وجبتك. أي رقم غير مأخوذ من ملصق أو قائمة رسمية هو تقدير منك.
        </p>
        <form onSubmit={submit}>
          <label>
            اسم الوجبة
            <input
              name="name"
              required
              maxLength={80}
              placeholder="مثال: غداء من المطعم"
            />
          </label>
          <label>
            السعرات (سعرة)
            <input
              name="calories"
              type="number"
              min="0"
              max="6000"
              required
              inputMode="decimal"
            />
          </label>
          <div className="form-grid">
            <label>
              بروتين (غ)
              <input
                name="protein"
                type="number"
                min="0"
                max="500"
                defaultValue="0"
                required
              />
            </label>
            <label>
              كارب (غ)
              <input
                name="carbs"
                type="number"
                min="0"
                max="800"
                defaultValue="0"
                required
              />
            </label>
            <label>
              دهون (غ)
              <input
                name="fat"
                type="number"
                min="0"
                max="500"
                defaultValue="0"
                required
              />
            </label>
          </div>
          <label>
            مصدر القيم
            <select name="source">
              <option value="تقدير المستخدم، غير موثق">تقدير مني</option>
              <option value="من ملصق غذائي أدخله المستخدم؛ لم يتحقق التطبيق منه">
                نقلتها من ملصق غذائي
              </option>
              <option value="من قائمة المطعم أدخلها المستخدم؛ لم يتحقق التطبيق منها">
                نقلتها من قائمة المطعم
              </option>
            </select>
          </label>
          <button className="wide" type="submit">
            حفظ الوجبة
          </button>
        </form>
      </>
    );
  return (
    <>
      <h2>{kind === "activity" ? "تسجيل نشاط خارجي" : "تسجيل الوزن"}</h2>
      <p>
        {kind === "activity"
          ? "يمكنك تسجيل نشاط أنجزته سابقًا. لا يوجد تتبع تلقائي في هذا النموذج."
          : "عرض التقدم يعتمد على ما تسجله فقط. قد يتذبذب الوزن يوميًا."}
      </p>
      <form onSubmit={submit}>
        {kind === "activity" ? (
          <>
            <label>
              النشاط
              <select name="type">
                <option>مشي</option>
                <option>جري</option>
                <option>دراجة</option>
              </select>
            </label>
            <label>
              المدة (دقيقة)
              <input
                name="minutes"
                type="number"
                min="1"
                max="600"
                required
                inputMode="numeric"
                placeholder="مثال: 30"
              />
            </label>
            <label>
              المسافة بالكيلومتر (اختياري)
              <input
                name="distance"
                type="number"
                min="0"
                max="500"
                step="0.1"
                inputMode="decimal"
              />
            </label>
          </>
        ) : (
          <label>
            الوزن بالكيلوغرام
            <input
              name="kg"
              type="number"
              min="20"
              max="400"
              step="0.1"
              inputMode="decimal"
              required
              placeholder="مثال: 100"
            />
          </label>
        )}
        <label>
          {kind === "activity" ? "تاريخ النشاط" : "التاريخ"}
          <input
            name="date"
            type="date"
            defaultValue={day()}
            max={day()}
            required
          />
        </label>
        <button className="wide" type="submit">
          {kind === "activity" ? "حفظ النشاط" : "حفظ الوزن"}
        </button>
      </form>
    </>
  );
}
