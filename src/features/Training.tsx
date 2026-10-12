import { useState } from "react";
import { useDemo } from "../state/DemoContext";
import { EXERCISES, EXERCISE_SAFETY_NOTE_AR, getExercise } from "../domain/exerciseCatalog";
import { generateTrainingPlan } from "../domain/trainingPlan";
import type { TrainingPreferences, TrainingSession } from "../domain/types";

export function Training() {
  const { data, update, busy, readBlocked } = useDemo();
  const [place, setPlace] = useState<TrainingPreferences["place"]>(data.training?.preferences?.place ?? "gym");
  const [days, setDays] = useState<3 | 4 | 5>(data.training?.preferences?.daysPerWeek ?? 3);
  const [level, setLevel] = useState<TrainingPreferences["level"]>(data.training?.preferences?.level ?? "مبتدئ");
  const [selected, setSelected] = useState<string | null>(null);
  const training = data.training;
  const plan = training?.plans.at(-1);
  const active = training?.sessions.find(s => s.status === "in_progress");
  const caution = { knee: data.settings.knee, shoulder: data.settings.shoulder };
  const disabled = busy || readBlocked;
  const choosePlan = () => {
    const preferences: TrainingPreferences = { place, daysPerWeek: days, level, ...caution };
    const next = generateTrainingPlan(preferences, crypto.randomUUID(), new Date().toISOString());
    update(d => {
      if (!d.training) return;
      d.training.preferences = preferences;
      d.training.plans.push(next);
    }, "تم إنشاء جدول تمارينك وحفظه.");
  };
  const start = (dayId: string) => {
    if (!plan || active) return;
    const day = plan.days.find(d => d.id === dayId);
    if (!day) return;
    const now = new Date();
    const session: TrainingSession = {
      id: crypto.randomUUID(), planId: plan.id, date: now.toLocaleDateString("en-CA"),
      status: "in_progress", startedAt: now.toISOString(), endedAt: null, confirmedMinutes: null,
      exercises: day.exerciseIds.map(exerciseId => ({ exerciseId, skipped: false, sets: [] })),
    };
    update(d => { d.training?.sessions.push(session); }, "بدأ التمرين. سجّل مجموعاتك الفعلية.");
  };
  const addSet = (exerciseId: string) => {
    if (!active) return;
    update(d => {
      const exercise = d.training?.sessions.find(s => s.id === active.id)?.exercises.find(e => e.exerciseId === exerciseId);
      exercise?.sets.push({ reps: 10, loadKg: null });
    }, "تم تسجيل مجموعة من 10 تكرارات بدون وزن إضافي.");
  };
  const finish = () => {
    if (!active) return;
    update(d => {
      const session = d.training?.sessions.find(s => s.id === active.id);
      if (!session) return;
      session.status = "completed";
      session.endedAt = new Date().toISOString();
      session.confirmedMinutes = Math.max(0, Math.round((Date.now() - Date.parse(session.startedAt)) / 60000));
    }, "اكتمل التمرين وحُفظ. لا تُضاف الدقائق إلى سجل النشاط تلقائيًا.");
  };
  return <section aria-label="مكتبة التمارين" style={{ paddingBottom: 32 }}>
    <h1>تمارينك</h1>
    <p>دليل عربي مبسّط لأجهزة النادي وتمارين المنزل، يعمل دون اتصال.</p>
    <p role="note">{EXERCISE_SAFETY_NOTE_AR}</p>
    <div className="card" style={{ padding: 16, marginBottom: 16 }}>
      <h2>جدولك الأسبوعي</h2>
      <label htmlFor="training-place">مكان التمرين</label>
      <select id="training-place" value={place} onChange={e => setPlace(e.target.value as TrainingPreferences["place"])}>
        <option value="gym">النادي</option><option value="home">المنزل</option><option value="both">النادي والمنزل</option>
      </select>
      <label htmlFor="training-days">عدد الأيام</label>
      <select id="training-days" value={days} onChange={e => setDays(Number(e.target.value) as 3 | 4 | 5)}>
        {[3,4,5].map(n => <option key={n} value={n}>{n} أيام</option>)}
      </select>
      <label htmlFor="training-level">المستوى</label>
      <select id="training-level" value={level} onChange={e => setLevel(e.target.value as TrainingPreferences["level"])}>
        {["مبتدئ","متوسط","متقدم"].map(n => <option key={n}>{n}</option>)}
      </select>
      <p>قيود الركبة والكتف تُقرأ من إعدادات الملف الشخصي.</p>
      <button disabled={disabled || !!active} onClick={choosePlan}>إنشاء جدول وحفظه</button>
      {plan && <div><h3>الجدول المحفوظ</h3>{plan.days.map((day, index) =>
        <div key={day.id} style={{ marginBottom: 12 }}>
          <strong>اليوم {index + 1}: {day.id.split("-").slice(2).join("-")}</strong>
          <p>{day.exerciseIds.map(id => getExercise(id)?.nameAr ?? "تمرين غير متوفر").join("، ")}</p>
          <button disabled={disabled || !!active} onClick={() => start(day.id)}>ابدأ هذا اليوم</button>
        </div>
      )}</div>}
    </div>
    {active && <div className="card" style={{ padding: 16, marginBottom: 16 }}>
      <h2>التمرين الجاري</h2>
      {active.exercises.map(e => <div key={e.exerciseId} style={{ marginBottom: 12 }}>
        <strong>{getExercise(e.exerciseId)?.nameAr ?? e.exerciseId}</strong>
        <p>المجموعات المسجلة: {e.sets.length}</p>
        <button disabled={disabled} onClick={() => addSet(e.exerciseId)}>سجّل 10 تكرارات</button>
      </div>)}
      <button disabled={disabled} onClick={finish}>إنهاء التمرين وحفظه</button>
    </div>}
    <h2>مكتبة التمارين ({EXERCISES.length})</h2>
    {EXERCISES.filter(e => place === "both" || e.place === place).map(e =>
      <div key={e.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
        <h3>{e.nameAr}</h3>
        <p>{e.place === "gym" ? "النادي" : "المنزل"} | {e.equipmentAr}</p>
        <p>العضلات: {e.primaryMusclesAr.join("، ")}</p>
        {e.restrictions.some(r => caution[r]) && <p role="note">تنبيه: هذا التمرين قد لا يناسب قيود المفاصل المحددة.</p>}
        <button aria-expanded={selected === e.id} onClick={() => setSelected(selected === e.id ? null : e.id)}>
          {selected === e.id ? "إخفاء الشرح" : "طريقة الأداء والأخطاء"}
        </button>
        {selected === e.id && <div>
          <h4>طريقة الأداء</h4><ol>{e.stepsAr.map((s,i) => <li key={i}>{s}</li>)}</ol>
          <h4>أخطاء شائعة</h4><ul>{e.mistakesAr.map((s,i) => <li key={i}>{s}</li>)}</ul>
        </div>}
      </div>)}
  </section>;
}
