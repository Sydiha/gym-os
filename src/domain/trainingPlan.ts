import type { TrainingPlan, TrainingPreferences } from "./types";
import { trainingPrescription } from "./trainingLevels";
import { EXERCISE_CATALOG_VERSION, listExercisesForPreferences, type ExercisePlace } from "./exerciseCatalog";

export function generateTrainingPlan(preferences: TrainingPreferences, id: string, createdAt: string): TrainingPlan {
  const place: ExercisePlace = preferences.place === "home" ? "home" : "gym";
  const available = listExercisesForPreferences(place, preferences).map(e => e.id);
  if (available.length === 0) throw new Error("لا توجد تمارين مناسبة للقيود المختارة.");
  const prescription = trainingPrescription(preferences.level);
  const patterns: Record<3 | 4 | 5, string[]> = {
    3: ["A", "B", "A"],
    4: ["علوي A", "سفلي A", "علوي B", "سفلي B"],
    5: ["علوي A", "سفلي A", "علوي B", "سفلي B", "نشاط خفيف"],
  };
  const days = patterns[preferences.daysPerWeek].map((label, index) => {
    const lower = available.filter(e => /leg|calf|squat|glute|march/.test(e));
    const upper = available.filter(e => /chest|row|pull|pushup/.test(e));
    const base = label.includes("علوي") ? upper : label.includes("سفلي") ? lower :
      label === "نشاط خفيف" ? available.filter(e => /march|calf/.test(e)) : available;
    const candidates = base.length ? base : available;
    // Alternate exercise selection by day and experience while preserving joint restrictions.
    const offset = (label === "B" || label.endsWith("B") ? 1 : 0) + (preferences.level === "متقدم" ? 2 : preferences.level === "متوسط" ? 1 : 0);
    const start = offset % candidates.length;
    const ordered = [...candidates.slice(start), ...candidates.slice(0, start)];
    return { id: `day-${index + 1}-${label}`, exerciseIds: ordered.slice(0, prescription.exercisesPerDay) };
  });
  return { id, catalogVersion: EXERCISE_CATALOG_VERSION, templateId: `${place}-${preferences.daysPerWeek}d-${preferences.level}`, createdAt, days };
}
