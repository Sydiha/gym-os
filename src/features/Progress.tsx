import { useDemo } from "../state/DemoContext";
import {
  fmt,
  formatDate,
  latestWeight,
  week,
  weeklyDays,
  weeklyMinutes,
} from "../domain/rules";
import { ActivityBars, WeightVisual } from "../ui/Summaries";
export function Progress() {
  const { data, open, openEdit, update } = useDemo();
  const meals = data.meals.filter((m) => week().includes(m.date));
  const weights = [...data.weights].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  function removeWeight(id: string) {
    if (!window.confirm("هل تريد حذف قياس الوزن هذا؟ ستبقى بقية القياسات محفوظة.")) return;
    update((draft) => { draft.weights = draft.weights.filter((weight) => weight.id !== id); }, "حُذف قياس الوزن وتحدّث القياس الأحدث.");
  }
  return (
    <>
      <h1 className="section-title">التقدم</h1>
      <p className="lead">ملخص مبني فقط على ما سجّلته في هذا النموذج.</p>
      <div className="progress-group">
        <h2>النشاط · آخر ٧ أيام</h2>
        <ActivityBars />
        <p>
          أيام النشاط: {fmt(weeklyDays(data))} · الدقائق:{" "}
          {fmt(weeklyMinutes(data))}
        </p>
      </div>
      <div className="progress-group">
        <h2>الوزن</h2>
        {latestWeight(data) ? (
          <WeightVisual />
        ) : (
          <p className="empty">لم تسجّل وزنك بعد.</p>
        )}
        <button className="pill" onClick={() => open("weight")}>
          سجّل الوزن
        </button>
        {weights.length > 0 && <>
          <h3>سجل قياسات الوزن</h3>
          {weights.map((weight) => <div className="record" key={weight.id}>
            <span>{fmt(weight.kg)} كجم<small>{formatDate(weight.date)}</small></span>
            <div className="record-actions">
              <button className="small-btn" aria-label={`تعديل قياس ${fmt(weight.kg)} كجم`} onClick={() => openEdit({ kind: "weight", record: weight })}>تعديل</button>
              <button className="small-btn" aria-label={`حذف قياس ${fmt(weight.kg)} كجم`} onClick={() => removeWeight(weight.id)}>حذف</button>
            </div>
          </div>)}
        </>}
      </div>
      <div className="progress-group">
        <h2>التغذية · آخر ٧ أيام</h2>
        {meals.length ? (
          <>
            <p>
              الوجبات المسجلة: {fmt(meals.length)} · السعرات:{" "}
              {fmt(meals.reduce((n, m) => n + m.calories, 0))}
            </p>
            <p className="note">
              المجموع يعكس الوجبات المسجلة فقط، ولا يمثل كل ما تناولته.
            </p>
          </>
        ) : (
          <p className="empty">لا توجد وجبات مسجلة في آخر ٧ أيام.</p>
        )}
      </div>
    </>
  );
}
