import { useDemo } from "../state/DemoContext";
import { day, fmt, nutrient, todayMeals, uid } from "../domain/rules";
import { Calories } from "../ui/Summaries";
import { restaurantOptions } from "../domain/fixtures";
export function Nutrition() {
  const { data, open, update } = useDemo();
  const meals = todayMeals(data);
  return (
    <>
      <h1 className="section-title">التغذية</h1>
      <p className="lead">
        سجّل ما تناولته، خاصة وجبات المطاعم، وعدّل التقديرات بحسب وجبتك.
      </p>
      <Calories />
      <div className="macro-row">
        {(
          [
            ["البروتين", "protein"],
            ["الكربوهيدرات", "carbs"],
            ["الدهون", "fat"],
          ] as const
        ).map(([label, key]) => (
          <div key={key}>
            <small>{label}</small>
            <strong>{fmt(nutrient(data, key))} غ</strong>
          </div>
        ))}
      </div>
      <div className="section-actions">
        <button className="wide" onClick={() => open("meal")}>
          سجّل وجبة
        </button>
        <button className="outline" onClick={() => open("restaurant")}>
          ماذا أطلب اليوم؟
        </button>
      </div>
      <h2>وجبات اليوم</h2>
      {meals.length ? (
        meals.map((m) => (
          <div className="record" key={m.id}>
            <span>
              {m.name}
              <small>
                {fmt(m.calories)} سعرة · بروتين {fmt(m.protein)}غ · كارب{" "}
                {fmt(m.carbs)}غ · دهون {fmt(m.fat)}غ
              </small>
              <small>{m.source}</small>
            </span>
            <button
              className="small-btn"
              onClick={() =>
                update((d) => {
                  if (!d.favorites.some((f) => f.name === m.name))
                    d.favorites.push({ ...m, id: uid() });
                }, "حُفظت الوجبة في المفضلة.")
              }
            >
              {data.favorites.some((f) => f.name === m.name) ? "محفوظة" : "حفظ"}
            </button>
          </div>
        ))
      ) : (
        <p className="empty">
          لم تسجّل وجبة اليوم. يمكنك البدء بوجبة مطعم أو إدخال يدوي.
        </p>
      )}
      <h2>المفضلة</h2>
      {data.favorites.length ? (
        data.favorites.map((m) => (
          <div className="record" key={m.id}>
            <span>
              {m.name}
              <small>
                {fmt(m.calories)} سعرة · {m.source}
              </small>
            </span>
            <button
              className="small-btn"
              onClick={() =>
                update((d) => {
                  d.meals.push({ ...m, id: uid(), date: day() });
                }, "أُضيفت الوجبة المفضلة إلى اليوم.")
              }
            >
              إضافة لليوم
            </button>
          </div>
        ))
      ) : (
        <p className="empty">احفظ وجبة لتصل إليها بسرعة لاحقًا.</p>
      )}
    </>
  );
}
export function Restaurant() {
  const { update, setSheet, navigate } = useDemo();
  return (
    <>
      <h2>ماذا أطلب اليوم؟</h2>
      <p>
        أمثلة عامة للمقارنة. الأرقام تقريبية وغير موثقة لأي مطعم؛ تختلف بالحجم
        والإضافات وطريقة التحضير.
      </p>
      {restaurantOptions.map((m) => (
        <div className="record restaurant" key={m.name}>
          <span>
            <b>{m.name}</b>
            <small>
              حوالي {fmt(m.calories)} سعرة · بروتين {fmt(m.protein)}غ · كارب{" "}
              {fmt(m.carbs)}غ · دهون {fmt(m.fat)}غ
            </small>
            <small>المصدر: تقدير تقريبي غير موثق</small>
          </span>
          <button
            className="small-btn"
            onClick={() => {
              navigate("التغذية");
              update((d) => {
                d.meals.push({
                  ...m,
                  id: uid(),
                  date: day(),
                  source: "تقدير تقريبي غير موثق؛ ليس من بيانات مطعم",
                });
              }, "أُضيفت الوجبة بقيم تقديرية قابلة للمراجعة.");
              setSheet(null);
            }}
          >
            اختر
          </button>
        </div>
      ))}
    </>
  );
}
