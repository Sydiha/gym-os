import { useEffect, useState } from "react";
import { useDemo } from "../state/DemoContext";
import { day, eligible, fmt, latestWeight, weeklyDays } from "../domain/rules";
import { Calories, ActivityBars, WeightVisual } from "../ui/Summaries";
import { Icon } from "../ui/Icon";
import { DemoControls } from "./Settings";
export function Dashboard() {
  const { data, time, open, update, water, mode } = useDemo();
  const [today, setToday] = useState(day);
  useEffect(() => {
    const refresh = () => setToday(day());
    const interval = window.setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const rest = data.settings.dayType === "rest",
    done = data.homeSessions.some((s) => s.date === day()),
    weight = latestWeight(data);
  return (
    <>
      <h1>
        اليوم يكفي أن <span className="underline">تبدأ</span>
      </h1>
      <p className="level">مستواك: {data.settings.level}</p>
      <Calories />
      <div className="water">
        <span>الماء {fmt(data.waterDate === today ? data.water : 0)} أكواب</span>
        <button className="pill" onClick={water}>
          + كوب
        </button>
      </div>
      <section className="timeline" aria-label="خطوات اليوم">
        <div className="step">
          <div className="stepno">1</div>
          <div className="stepbody">
            <div className="steptitle">
              <span className="icon">
                <Icon name="meal" />
              </span>
              وجبتك القادمة
            </div>
            <button className="wide" onClick={() => open("meal")}>
              سجّل وجبة
            </button>
          </div>
        </div>
        <div className="step">
          <div className="stepno">2</div>
          <div className="stepbody">
            <div className="steptitle">
              <span className="icon">
                <Icon name="walk" />
              </span>
              اخرج للمشي
            </div>
            <p className="hint">
              نشاط خارجي يناسب يومك · لا توجد قراءة تلقائية للخطوات
            </p>
            {mode === "demo" ? <div className="weather">
              الطقس: مثال توضيحي · ٢٤°
              <small>وقت أنسب للمشي — بيانات توضيحية</small>
            </div> : <div className="weather">
              راجع ظروف الطقس المحلية قبل الخروج
              <small>لا يعرض التطبيق بيانات طقس مباشرة</small>
            </div>}
            <button className="outline" onClick={() => open("activity")}>
              سجّل نشاطًا خارجيًا
            </button>
            {eligible(data, time) && (
              <aside className="planb" aria-label="بديل نشاط اليوم">
                <h3>بديل نشاط اليوم</h3>
                <p>
                  ما قدرت تطلع اليوم؟ عندنا بديل بسيط لك. ربما تحركت ولم تسجّله؛
                  القرار لك.
                </p>
                <div className="actions">
                  <button className="primary" onClick={() => open("plan")}>
                    جرب تمرين منزلي
                  </button>
                  <button
                    className="quiet"
                    onClick={() =>
                      update((d) => {
                        d.declinedDate = day();
                      }, "تم إخفاء الاقتراح اليوم دون أي تأثير على تقدمك.")
                    }
                  >
                    ليس اليوم
                  </button>
                </div>
              </aside>
            )}
            {rest && (
              <aside className="planb rest">
                <h3>يوم راحة وتعافٍ</h3>
                <p>لا توجد جلسة بديلة مقترحة اليوم.</p>
              </aside>
            )}
            {done && (
              <aside className="planb rest">
                <h3>تم تسجيل جلستك المنزلية</h3>
                <p>أُضيفت دقائقها إلى تقدمك الأسبوعي.</p>
              </aside>
            )}
          </div>
        </div>
        <div className="step future">
          <div className="stepno">3</div>
          <div className="stepbody">
            <div className="steptitle">
              <span className="icon">
                <Icon name="gym" />
              </span>
              النادي لاحقًا
            </div>
          </div>
        </div>
      </section>
      <section className="weekly">
        <div className="weekly-head">
          <p>أيام النشاط · آخر ٧ أيام: {fmt(weeklyDays(data))}</p>
          <h2>رحلة الأسبوع</h2>
        </div>
        <div className="charts">
          <div>
            <div className="chart-title">النشاط (دقيقة)</div>
            <ActivityBars />
          </div>
          <div>
            <div className="chart-title">
              الوزن {weight ? "· " + fmt(weight.kg) + " كجم" : ""}
            </div>
            <WeightVisual />
          </div>
        </div>
        <div className="chart-foot">{mode === "demo" ? "من بيانات Demo المسجلة" : "من سجلاتك المسجلة"}</div>
      </section>
      {mode === "demo" && <DemoControls />}
    </>
  );
}
