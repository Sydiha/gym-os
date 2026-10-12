import type { TrainingPlan, TrainingPreferences } from "./types";
import { EXERCISE_CATALOG_VERSION, listExercisesForPreferences, type ExercisePlace } from "./exerciseCatalog";

export function generateTrainingPlan(preferences: TrainingPreferences, id: string, createdAt: string): TrainingPlan {
  const place: ExercisePlace = preferences.place === "home" ? "home" : "gym";
  const available = listExercisesForPreferences(place, preferences).map(e => e.id);
  if (available.length === 0) throw new Error("لا توجد تمارين مناسبة للقيود المختارة.");
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
    const offset = label === "B" || label.endsWith("B") ? 1 : 0;
    return { id: `day-${index + 1}-${label}`, exerciseIds: [...candidates.slice(offset), ...candidates.slice(0, offset)].slice(0, 5) };
  });
  return { id, catalogVersion: EXERCISE_CATALOG_VERSION, templateId: `${place}-${preferences.daysPerWeek}d-${preferences.level}`, createdAt, days };
}
