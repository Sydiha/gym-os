import { useDemo } from "../state/DemoContext";
import { allActivities, fmt, weeklyMinutes } from "../domain/rules";
export function Activity() {
  const { data, open } = useDemo();
  const activities = allActivities(data);
  return (
    <>
      <h1 className="section-title">النشاط</h1>
      <p className="lead">
        سجّل المشي أو الجري أو الدراجة، حتى لو أنجزت النشاط سابقًا.
      </p>
      <div className="stat">
        {fmt(weeklyMinutes(data))} <small>دقيقة خلال آخر ٧ أيام</small>
      </div>
      <button className="wide" onClick={() => open("activity")}>
        تسجيل نشاط خارجي
      </button>
      <h2>سجل النشاط</h2>
      {activities.length ? (
        [...activities]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((a) => (
            <div className="record" key={a.id}>
              <span>
                {a.type}
                <small>
                  {fmt(a.minutes)} دقيقة{" "}
                  {a.distance != null ? "· " + fmt(a.distance) + " كم" : ""} ·{" "}
                  {a.date}
                </small>
              </span>
            </div>
          ))
      ) : (
        <p className="empty">
          لا يوجد نشاط مسجل بعد. عدم التسجيل لا يعني أنك لم تتحرك.
        </p>
      )}
      <div className="info">
        بديل المنزل يظهر في الرئيسية عند حلول وقت النشاط، ويبقى اختياريًا.
      </div>
    </>
  );
}
