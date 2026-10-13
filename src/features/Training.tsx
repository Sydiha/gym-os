import { useEffect, useState } from "react";
import { useDemo } from "../state/DemoContext";
import { EXERCISES, EXERCISE_SAFETY_NOTE_AR, getExercise } from "../domain/exerciseCatalog";
import { generateTrainingPlan } from "../domain/trainingPlan";
import { recentExerciseComparison } from "../domain/exerciseComparison";
import { getReviewedExerciseMedia } from "../domain/reviewedExerciseMedia";
import type { TrainingPreferences, TrainingSession } from "../domain/types";

function SetEntry({ exerciseId, name, disabled, skipped, onRecord }: { exerciseId: string; name: string; disabled: boolean; skipped: boolean; onRecord: (id: string, reps: number, loadKg: number | null) => void }) {
  const [reps, setReps] = useState("10");
  const [load, setLoad] = useState("");
  const count = Number(reps);
  const kg = load.trim() === "" ? null : Number(load);
  const repsValid = reps.trim() !== "" && Number.isInteger(count) && count >= 1 && count <= 1000;
  const loadValid = kg === null || (Number.isFinite(kg) && kg >= 0 && kg <= 1000);
  const repsId = `training-reps-${exerciseId}`;
  const loadId = `training-load-${exerciseId}`;
  return <div className="training-set-entry">
    <label htmlFor={repsId}>التكرارات — {name}</label>
    <input id={repsId} type="number" inputMode="numeric" min="1" max="1000" value={reps} aria-invalid={!repsValid} aria-describedby={!repsValid ? `${repsId}-error` : undefined} onChange={e => setReps(e.target.value)} />
    {!repsValid && <p id={`${repsId}-error`} role="alert">أدخل عدد تكرارات صحيحًا بين 1 و1000.</p>}
    <label htmlFor={loadId}>الوزن بالكيلو (اختياري) — {name}</label>
    <input id={loadId} type="number" inputMode="decimal" min="0" max="1000" step="0.5" value={load} aria-invalid={!loadValid} aria-describedby={!loadValid ? `${loadId}-error` : undefined} onChange={e => setLoad(e.target.value)} />
    {!loadValid && <p id={`${loadId}-error`} role="alert">أدخل وزنًا بين 0 و1000 كجم، أو اتركه فارغًا.</p>}
    <button disabled={disabled || skipped || !repsValid || !loadValid} onClick={() => onRecord(exerciseId, count, kg)}>تسجيل مجموعة</button>
  </div>;
}

function RecordedSet({ exerciseId, index, reps, loadKg, disabled, onSave, onDelete }: {
  exerciseId: string; index: number; reps: number; loadKg: number | null; disabled: boolean;
  onSave: (exerciseId: string, index: number, reps: number, loadKg: number | null) => void;
  onDelete: (exerciseId: string, index: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftReps, setDraftReps] = useState(String(reps));
  const [draftLoad, setDraftLoad] = useState(loadKg === null ? "" : String(loadKg));
  const count = Number(draftReps);
  const kg = draftLoad.trim() === "" ? null : Number(draftLoad);
  const valid = draftReps.trim() !== "" && Number.isInteger(count) && count >= 1 && count <= 1000 &&
    (kg === null || (Number.isFinite(kg) && kg >= 0 && kg <= 1000));
  const label = `المجموعة ${index + 1}`;
  return <li>
    {!editing ? <>
      <span>{reps} تكرارات، {loadKg === null ? "وزن الجسم / غير محدد" : `${loadKg} كجم`}</span>{" "}
      <button disabled={disabled} aria-label={`تعديل ${label} للتمرين ${exerciseId}`} onClick={() => {
        setDraftReps(String(reps)); setDraftLoad(loadKg === null ? "" : String(loadKg)); setEditing(true);
      }}>تعديل</button>{" "}
      <button disabled={disabled} aria-label={`حذف ${label} للتمرين ${exerciseId}`} onClick={() => {
        if (window.confirm(`هل تريد حذف ${label}؟`)) onDelete(exerciseId, index);
      }}>حذف</button>
    </> : <div className="training-set-edit">
      <label>تعديل التكرارات — {label}<input type="number" inputMode="numeric" min="1" max="1000" value={draftReps} onChange={e => setDraftReps(e.target.value)} /></label>
      <label>تعديل الوزن — {label}<input type="number" inputMode="decimal" min="0" max="1000" step="0.5" value={draftLoad} onChange={e => setDraftLoad(e.target.value)} /></label>
      {!valid && <p role="alert">أدخل تكرارات صحيحة ووزنًا بين 0 و1000 كجم، أو اترك الوزن فارغًا.</p>}
      <button disabled={disabled || !valid} onClick={() => { onSave(exerciseId, index, count, kg); setEditing(false); }}>حفظ التعديل</button>{" "}
      <button onClick={() => setEditing(false)}>إلغاء</button>
    </div>}
  </li>;
}

export function Training() {
  const { data, update, busy, readBlocked } = useDemo();
  const [place, setPlace] = useState<TrainingPreferences["place"]>(data.training?.preferences?.place ?? "gym");
  const [days, setDays] = useState<3 | 4 | 5>(data.training?.preferences?.daysPerWeek ?? 3);
  const [level, setLevel] = useState<TrainingPreferences["level"]>(data.training?.preferences?.level ?? "مبتدئ");
  const [selected, setSelected] = useState<string | null>(null);
  // Restore persisted preferences after IndexedDB hydration, not only on the first render.
  const storedPlace = data.training?.preferences?.place;
  const storedDays = data.training?.preferences?.daysPerWeek;
  const storedLevel = data.training?.preferences?.level;
  useEffect(() => {
    if (storedPlace) setPlace(storedPlace);
    if (storedDays) setDays(storedDays);
    if (storedLevel) setLevel(storedLevel);
  }, [storedPlace, storedDays, storedLevel]);
  const training = data.training;
  const plan = training?.plans.at(-1);
  const active = training?.sessions.find(s => s.status === "in_progress");
  const completedSessions = (training?.sessions ?? []).filter(s => s.status === "completed").slice().sort((a, b) => (b.endedAt ?? b.startedAt).localeCompare(a.endedAt ?? a.startedAt));
  const caution = { knee: data.settings.knee, shoulder: data.settings.shoulder };
  const disabled = busy || readBlocked;
  const recordedSets = active?.exercises.reduce((count, exercise) => count + exercise.sets.length, 0) ?? 0;
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
  const addSet = (exerciseId: string, reps: number, loadKg: number | null) => {
    if (!active) return;
    update(d => {
      const exercise = d.training?.sessions.find(s => s.id === active.id)?.exercises.find(e => e.exerciseId === exerciseId);
      if (exercise && !exercise.skipped) exercise.sets.push({ reps, loadKg });
    }, "تم تسجيل المجموعة.");
  };
  const editSet = (exerciseId: string, index: number, reps: number, loadKg: number | null) => {
    if (!active || busy || readBlocked) return;
    update(d => {
      const sets = d.training?.sessions.find(s => s.id === active.id)?.exercises.find(e => e.exerciseId === exerciseId)?.sets;
      if (sets?.[index]) sets[index] = { reps, loadKg };
    }, "تم تعديل المجموعة وحفظها.");
  };
  const deleteSet = (exerciseId: string, index: number) => {
    if (!active || busy || readBlocked) return;
    update(d => {
      const sets = d.training?.sessions.find(s => s.id === active.id)?.exercises.find(e => e.exerciseId === exerciseId)?.sets;
      if (sets && index >= 0 && index < sets.length) sets.splice(index, 1);
    }, "تم حذف المجموعة وحفظ التغيير.");
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
      {active.exercises.map(e => <div key={e.exerciseId} className="training-day">
        <strong>{getExercise(e.exerciseId)?.nameAr ?? e.exerciseId}</strong>
        <p>المجموعات المسجلة: {e.sets.length}{e.skipped ? " (تم التخطي)" : ""}</p>
        <ul>{e.sets.map((set, i) => <RecordedSet key={`${e.exerciseId}-${i}`} exerciseId={e.exerciseId} index={i} reps={set.reps} loadKg={set.loadKg} disabled={disabled} onSave={editSet} onDelete={deleteSet} />)}</ul>
        <SetEntry exerciseId={e.exerciseId} name={getExercise(e.exerciseId)?.nameAr ?? e.exerciseId} disabled={disabled} skipped={e.skipped} onRecord={addSet} />{" "}
        <button disabled={disabled || e.skipped} onClick={() => skip(e.exerciseId)}>تخطي التمرين</button>
      </div>)}
      {recordedSets === 0 && <p role="note">سجّل مجموعة واحدة على الأقل قبل إنهاء التمرين، حتى لا تُغلق الجلسة دون أي نشاط مسجّل.</p>}
      <button disabled={disabled || recordedSets === 0} onClick={finish}>إنهاء التمرين وحفظه</button>
    </div>}
    <section className="training-panel" aria-label="سجل التمارين المكتملة">
      <h2>سجل التمارين المكتملة ({completedSessions.length})</h2>
      {completedSessions.length === 0 ? <p className="training-meta">لا توجد جلسات مكتملة بعد. تظهر هنا الجلسات التي تنهيها وتحفظها.</p> :
        completedSessions.map(session => <details key={session.id} className="training-day">
          <summary>جلسة {session.date} · {session.confirmedMinutes ?? "غير محددة"} دقيقة · {session.exercises.reduce((n, e) => n + e.sets.length, 0)} مجموعات</summary>
          {session.exercises.map(exercise => <div key={exercise.exerciseId}>
            <strong>{getExercise(exercise.exerciseId)?.nameAr ?? exercise.exerciseId}</strong>
            {exercise.skipped && <p>تم تخطي التمرين</p>}
            {exercise.sets.length ? <ol>{exercise.sets.map((set, index) => <li key={index}>{set.reps} تكرارات، {set.loadKg === null ? "الوزن غير محدد" : `${set.loadKg} كجم`}</li>)}</ol> : <p>لا توجد مجموعات مسجلة</p>}
          </div>)}
        </details>)}
    </section>
    <section className="training-panel" aria-label="مقارنة الأداء السابق">
      <h2>مقارنة آخر جلستين لكل تمرين</h2>
      <p className="training-meta">أعلى وزن وأكبر عدد تكرارات مسجلة في كل جلسة، وليسا بالضرورة في المجموعة نفسها. المقارنة وصفية ولا تقيس التحسن في القوة وحدها.</p>
      {EXERCISES.map(exercise => {
        const comparison = recentExerciseComparison(completedSessions, exercise.id);
        if (!comparison) return null;
        const { latest, previous } = comparison;
        return <div key={exercise.id} className="training-day">
          <strong>{exercise.nameAr}</strong>
          <p>الأحدث ({latest.date}): {latest.setCount} مجموعات، أقصى تكرارات {latest.maxReps}، أقصى وزن {latest.maxLoadKg === null ? "غير مسجل" : `${latest.maxLoadKg} كجم`}</p>
          <p>السابقة ({previous.date}): {previous.setCount} مجموعات، أقصى تكرارات {previous.maxReps}، أقصى وزن {previous.maxLoadKg === null ? "غير مسجل" : `${previous.maxLoadKg} كجم`}</p>
        </div>;
      })}
      {completedSessions.length < 2 && <p className="training-meta">تظهر المقارنة بعد تسجيل جلستين مكتملتين للتمرين نفسه.</p>}
    </section>
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
          {(getReviewedExerciseMedia(e.id)?.correctExamples ?? [{ ...getReviewedExerciseMedia(e.id)!.correct, labelAr: "" }]).map((example, i) => <div key={i} className="training-technique-example">
            <img className="training-detail-photo" src={example.localPath} alt={example.altAr} loading="lazy" decoding="async" />
            {example.labelAr && <p>{example.labelAr}</p>}
          </div>)}
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
