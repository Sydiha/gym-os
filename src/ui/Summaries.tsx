import type { CSSProperties } from "react";
import { useDemo } from "../state/DemoContext";
import {
  fmt,
  latestWeight,
  nutrient,
  week,
  weekly,
  weeklyMinutes,
} from "../domain/rules";
export function Calories() {
  const { data } = useDemo();
  const used = nutrient(data, "calories"),
    left = data.goal - used;
  return (
    <>
      <div className="cal-head">
        <span>
          هدفك <b>{fmt(data.goal)}</b> سعرة <span className="accent">♦</span>
        </span>
        <span className="muted">
          {left >= 0 ? fmt(left) + " متبقية" : fmt(-left) + " فوق الهدف"}
        </span>
      </div>
      <div
        className="meter"
        role="meter"
        aria-label="السعرات المستهلكة"
        aria-valuemin={0}
        aria-valuemax={data.goal}
        aria-valuenow={Math.min(used, data.goal)}
      >
        <b style={{ width: Math.min(100, (used / data.goal) * 100) + "%" }} />
      </div>
      <div className="cal-used">{fmt(used)} مستهلكة</div>
    </>
  );
}
export function ActivityBars() {
  const { data } = useDemo();
  const days = week(),
    totals = days.map((d) =>
      weekly(data)
        .filter((a) => a.date === d)
        .reduce((n, a) => n + a.minutes, 0),
    ),
    top = Math.max(30, ...totals);
  if (!totals.some(Boolean))
    return <p className="empty">لا يوجد نشاط مسجل بعد.</p>;
  return (
    <>
      <div className="bars" aria-label="دقائق النشاط خلال آخر سبعة أيام">
        {totals.map((n, i) => (
          <span
            key={days[i]}
            className="bar"
            role="img"
            aria-label={`${days[i]}: ${fmt(n)} دقيقة`}
            title={`${days[i]}: ${n} دقيقة`}
            style={
              {
                "--h": `${n ? Math.max(7, (n / top) * 100) : 2}%`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="chart-axis">
        <span>قبل ٦ أيام</span>
        <span>اليوم</span>
      </div>
      <div className="mini-total">{fmt(weeklyMinutes(data))} دقيقة مسجلة</div>
    </>
  );
}
export function WeightVisual() {
  const { data } = useDemo();
  const w = latestWeight(data);
  return w ? (
    <div className="weight-chart real-weight">
      <b>{fmt(w.kg)} كجم</b>
      <small>آخر تسجيل: {w.date}</small>
    </div>
  ) : (
    <p className="empty">لا يوجد وزن مسجل بعد.</p>
  );
}
