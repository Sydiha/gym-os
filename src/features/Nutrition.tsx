import { useDemo } from "../state/DemoContext";
import { day, fmt, hasDuplicateMeal, nutrient, todayMeals, uid } from "../domain/rules";
import { Calories } from "../ui/Summaries";
import { restaurantOptions } from "../domain/fixtures";
export function Nutrition() {
  const { data, open, openEdit, update } = useDemo();
  const meals = todayMeals(data);
  const previousMeals = data.meals.filter((meal) => meal.date !== day()).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  function removeMeal(id: string) {
    if (!window.confirm("هل تريد حذف هذه الوجبة؟ ستُحدّث السعرات والماكروز بعد الحذف.")) return;
    update((draft) => { draft.meals = draft.meals.filter((meal) => meal.id !== id); }, "حُذفت الوجبة وأُعيد حساب المغذيات.");
  }
  function removeFavorite(id: string) {
    if (!window.confirm("هل تريد إزالة هذه الوجبة من المفضلة؟ سيبقى أي سجل وجبة كما هو.")) return;
    update((draft) => { draft.favorites = draft.favorites.filter((meal) => meal.id !== id); }, "أُزيلت الوجبة من المفضلة.");
  }
  const mealRow = (m: typeof data.meals[number], favorite = false) => (
    <div className="record" key={`${favorite ? "favorite" : "meal"}-${m.id}`}>
      <span>{m.name}
        <small>{fmt(m.calories)} سعرة · بروتين {fmt(m.protein)}غ · كارب {fmt(m.carbs)}غ · دهون {fmt(m.fat)}غ</small>
        <small>{m.calories === 0 ? "٠ سعرة: قيمة صفرية مدخلة · " : ""}{m.source}</small>
      </span>
      <div className="record-actions">
        {favorite ? <>
          <button className="small-btn" onClick={() => {
            if (hasDuplicateMeal(data, m.name, day()) && !window.confirm("توجد وجبة بالاسم نفسه اليوم. هل تريد تسجيلها مرة أخرى؟")) return;
            update((d) => { d.meals.push({ ...m, id: uid(), date: day() }); }, "أُضيفت الوجبة المفضلة إلى اليوم.");
          }}>إضافة لليوم</button>
          <button className="small-btn" aria-label={`إزالة ${m.name} من المفضلة`} onClick={() => removeFavorite(m.id)}>إزالة</button>
        </> : <>
          <button className="small-btn" aria-label={`تعديل ${m.name}`} onClick={() => openEdit({ kind: "meal", record: m })}>تعديل</button>
          <button className="small-btn" aria-label={`حذف ${m.name}`} onClick={() => removeMeal(m.id)}>حذف</button>
          <button className="small-btn" aria-label={data.favorites.some((f) => f.name === m.name && f.calories === m.calories && f.protein === m.protein && f.carbs === m.carbs && f.fat === m.fat) ? "محفوظة" : "حفظ"} onClick={() => {
            if (data.favorites.some((f) => f.name === m.name && f.calories === m.calories && f.protein === m.protein && f.carbs === m.carbs && f.fat === m.fat)) return;
            update((d) => { d.favorites.push({ ...m, id: uid() }); }, "حُفظت الوجبة في المفضلة.");
          }}>{data.favorites.some((f) => f.name === m.name && f.calories === m.calories && f.protein === m.protein && f.carbs === m.carbs && f.fat === m.fat) ? "محفوظة" : "حفظ"}</button>
        </>}
      </div>
    </div>
  );
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
      {meals.length ? meals.map((m) => mealRow(m)) : (
        <p className="empty">
          لم تسجّل وجبة اليوم. يمكنك البدء بوجبة مطعم أو إدخال يدوي.
        </p>
      )}
      {previousMeals.length > 0 && <>
        <h2>سجل الوجبات السابقة</h2>
        {previousMeals.map((meal) => mealRow(meal))}
      </>}
      <h2>المفضلة</h2>
      {data.favorites.length ? (
        data.favorites.map((m) => mealRow(m, true))
      ) : (
        <p className="empty">احفظ وجبة لتصل إليها بسرعة لاحقًا.</p>
      )}
    </>
  );
}
export function Restaurant() {
  const { data, update, setSheet, navigate } = useDemo();
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
              if (hasDuplicateMeal(data, m.name, day()) && !window.confirm("سُجّلت وجبة بهذا الاسم اليوم. هل تريد إضافتها مرة أخرى؟")) return;
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
