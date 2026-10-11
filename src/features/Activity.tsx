import { useDemo } from "../state/DemoContext";
import { fmt, formatDate, formatTime, weeklyMinutes } from "../domain/rules";
import type { Activity as ActivityRecord } from "../domain/types";

export function Activity() {
  const { data, open, openEdit, update } = useDemo();
  const activities = [
    ...data.activities.map((record) => ({ ...record, homeSession: false })),
    ...data.homeSessions.map((session) => ({
      ...session, type: "منزلي", distance: null, startTime: undefined, homeSession: true,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date) || (b.startTime ?? "").localeCompare(a.startTime ?? "") || b.id.localeCompare(a.id));
  function removeActivity(id: string, homeSession: boolean) {
    if (!window.confirm("هل تريد حذف هذا النشاط؟")) return;
    update((draft) => {
      if (homeSession) draft.homeSessions = draft.homeSessions.filter((item) => item.id !== id);
      else draft.activities = draft.activities.filter((item) => item.id !== id);
    }, "حُذف النشاط وتحدّث التقدم الأسبوعي.");
  }
  return <>
    <h1 className="section-title">النشاط</h1>
    <p className="lead">سجّل المشي أو الجري أو الدراجة، حتى لو أنجزت النشاط سابقًا.</p>
    <div className="stat">{fmt(weeklyMinutes(data))} <small>دقيقة خلال آخر ٧ أيام</small></div>
    <button className="wide" onClick={() => open("activity")}>تسجيل نشاط خارجي</button>
    <h2>سجل النشاط</h2>
    {activities.length ? activities.map((activity) => <div className="record" key={activity.id}>
      <span>{activity.type}
        <small>{fmt(activity.minutes)} دقيقة{activity.distance != null ? ` · ${fmt(activity.distance)} كم` : ""}</small>
        <small>{formatDate(activity.date)} · {formatTime(activity.startTime)}</small>
      </span>
      <div className="record-actions">
        <button className="small-btn" aria-label={`تعديل ${activity.type}`} onClick={() => openEdit({ kind: "activity", record: activity as ActivityRecord & { homeSession?: boolean } })}>تعديل</button>
        <button className="small-btn" aria-label={`حذف ${activity.type}`} onClick={() => removeActivity(activity.id, activity.homeSession)}>حذف</button>
      </div>
    </div>) : <p className="empty">لا يوجد نشاط مسجل بعد. عدم التسجيل لا يعني أنك لم تتحرك.</p>}
    <div className="info">بديل المنزل يظهر في الرئيسية عند حلول وقت النشاط، ويبقى اختياريًا.</div>
  </>;
}
