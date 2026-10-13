import { useState } from "react";
import { useDemo } from "../state/DemoContext";
import { EXERCISES, EXERCISE_SAFETY_NOTE_AR, getExercise } from "../domain/exerciseCatalog";
import { generateTrainingPlan } from "../domain/trainingPlan";
import { getReviewedExerciseMedia } from "../domain/reviewedExerciseMedia";
import type { TrainingPreferences, TrainingSession } from "../domain/types";

export function Training() {
  const { data, update, busy, readBlocked } = useDemo();
  const [place, setPlace] = useState<TrainingPreferences["place"]>(data.training?.preferences?.place ?? "gym");
  const [days, setDays] = useState<3 | 4 | 5>(data.training?.preferences?.daysPerWeek ?? 3);
  const [level, setLevel] = useState<TrainingPreferences["level"]>(data.training?.preferences?.level ?? "مبتدئ");
  const [selected, setSelected] = useState<string | null>(null);
  const [reps, setReps] = useState("10");
  const [load, setLoad] = useState("");
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
    const count = Number(reps);
    const kg = load.trim() === "" ? null : Number(load);
    if (!Number.isInteger(count) || count < 1 || count > 1000 || (kg !== null && (!Number.isFinite(kg) || kg < 0 || kg > 1000))) return;
    if (!active) return;
    update(d => {
      const exercise = d.training?.sessions.find(s => s.id === active.id)?.exercises.find(e => e.exerciseId === exerciseId);
      exercise?.sets.push({ reps: count, loadKg: kg });
    }, "تم تسجيل المجموعة.");
  };
  const skip = (exerciseId: string) => {
    if (!active) return;
    update(d => {
      const exercise = d.training?.sessions.find(s => s.id === active.id)?.exercises.find(e => e.exerciseId === exerciseId);
      if (exercise) exercise.skipped = true;
    }, "تم تخطي التمرين.");
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
  return <section className="training-page" aria-label="مكتبة التمارين">
    <h1>تمارينك</h1>
    <p className="training-lead">دليل عربي مبسّط لأجهزة النادي وتمارين المنزل، يعمل دون اتصال.</p>
    <p className="training-safety" role="note">الصور التوضيحية مولدة بالذكاء الاصطناعي ومراجعة بصريًا فقط؛ ليست اعتمادًا من مدرب، وقد تختلف الأجهزة.</p>
    <p className="training-safety" role="note">{EXERCISE_SAFETY_NOTE_AR}</p>
    <div className="training-panel">
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
        <div key={day.id} className="training-day">
          <strong>اليوم {index + 1}: {day.id.split("-").slice(2).join("-")}</strong>
          <p>{day.exerciseIds.map(id => getExercise(id)?.nameAr ?? "تمرين غير متوفر").join("، ")}</p>
          <button disabled={disabled || !!active} onClick={() => start(day.id)}>ابدأ هذا اليوم</button>
        </div>
      )}</div>}
    </div>
    {active && <div className="training-panel">
      <h2>التمرين الجاري</h2>
      <label htmlFor="training-reps">التكرارات لكل مجموعة</label>
      <input id="training-reps" type="number" min="1" max="1000" value={reps} onChange={e => setReps(e.target.value)} />
      <label htmlFor="training-load">الوزن بالكيلو (اختياري)</label>
      <input id="training-load" type="number" min="0" max="1000" step="0.5" value={load} onChange={e => setLoad(e.target.value)} />
      {active.exercises.map(e => <div key={e.exerciseId} className="training-day">
        <strong>{getExercise(e.exerciseId)?.nameAr ?? e.exerciseId}</strong>
        <p>المجموعات المسجلة: {e.sets.length}{e.skipped ? " (تم التخطي)" : ""}</p>
        <ul>{e.sets.map((set, i) => <li key={i}>{set.reps} تكرارات، {set.loadKg === null ? "وزن الجسم / غير محدد" : `${set.loadKg} كجم`}</li>)}</ul>
        <button disabled={disabled || e.skipped} onClick={() => addSet(e.exerciseId)}>تسجيل مجموعة</button>{" "}
        <button disabled={disabled || e.skipped} onClick={() => skip(e.exerciseId)}>تخطي التمرين</button>
      </div>)}
      <button disabled={disabled} onClick={finish}>إنهاء التمرين وحفظه</button>
    </div>}
    <h2>مكتبة التمارين ({EXERCISES.length})</h2>
    {EXERCISES.filter(e => place === "both" || e.place === place).map(e =>
      <article key={e.id} className="training-exercise">
        {getReviewedExerciseMedia(e.id) && <img className="training-reviewed-photo" src={getReviewedExerciseMedia(e.id)!.localPath} alt={getReviewedExerciseMedia(e.id)!.altAr} loading="lazy" decoding="async" />}
        <h3>{e.nameAr}</h3>
        <p className="training-meta">{e.place === "gym" ? "النادي" : "المنزل"} · {e.equipmentAr}</p>
        <p className="training-meta">العضلات: {e.primaryMusclesAr.join("، ")}</p>
        {e.restrictions.some(r => caution[r]) && <p role="note">تنبيه: هذا التمرين قد لا يناسب قيود المفاصل المحددة.</p>}
        <button aria-expanded={selected === e.id} onClick={() => setSelected(selected === e.id ? null : e.id)}>
          {selected === e.id ? "إخفاء الشرح" : "طريقة الأداء والأخطاء"}
        </button>
        {selected === e.id && <div className="training-details">
          <h4>الوضعية الصحيحة</h4>
          <img className="training-detail-photo" src={getReviewedExerciseMedia(e.id)!.correct.localPath} alt={getReviewedExerciseMedia(e.id)!.correct.altAr} loading="lazy" decoding="async" />
          {getReviewedExerciseMedia(e.id)?.comparisons?.map((comparison, i) => <div key={i} className="training-angle-comparison">
            <h4>مقارنة {comparison.angleAr}</h4>
            <img className="training-detail-photo" src={comparison.localPath} alt={comparison.altAr} loading="lazy" decoding="async" />
          </div>)}
          <h4>طريقة الأداء</h4><ol className="training-visual-list">{e.stepsAr.map((s,i) => <li key={i}>
            {getReviewedExerciseMedia(e.id)?.steps?.[i] && <img className="training-detail-photo" src={getReviewedExerciseMedia(e.id)!.steps![i].localPath} alt={getReviewedExerciseMedia(e.id)!.steps![i].altAr} loading="lazy" decoding="async" />}
            <span>{s}</span>
          </li>)}</ol>
          <h4>أخطاء شائعة</h4><ul className="training-visual-list">{e.mistakesAr.map((s,i) => { const photo = getReviewedExerciseMedia(e.id)?.mistakes?.[i]; return <li key={i}>
            {photo && <img className="training-detail-photo" src={photo.localPath} alt={photo.altAr} loading="lazy" decoding="async" />}
            <span>{s}</span>
          </li>; })}</ul>
        </div>}
      </article>)}
  </section>;
}
