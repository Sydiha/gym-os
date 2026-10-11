import { useDemo } from "../state/DemoContext";
import {
  fmt,
  latestWeight,
  week,
  weeklyDays,
  weeklyMinutes,
} from "../domain/rules";
import { ActivityBars, WeightVisual } from "../ui/Summaries";
export function Progress() {
  const { data, open } = useDemo();
  const meals = data.meals.filter((m) => week().includes(m.date));
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
