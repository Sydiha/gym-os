import type { TrainingPlan, TrainingPreferences } from "./types";
import { trainingPrescription } from "./trainingLevels";
import { EXERCISE_CATALOG_VERSION, listExercisesForPreferences, type ExercisePlace } from "./exerciseCatalog";

export function generateTrainingPlan(preferences: TrainingPreferences, id: string, createdAt: string): TrainingPlan {
  // Each mixed day uses one location; prefer muscle-group variety but never bypass restrictions.
  if (preferences.place === "both") {
    const prescription = trainingPrescription(preferences.level);
    const locations: Record<3 | 4 | 5, ExercisePlace[]> = {
      3: ["gym", "home", "gym"],
      4: ["gym", "home", "gym", "home"],
      5: ["gym", "home", "gym", "home", "home"],
    };
    const focusByDay: Record<3 | 4 | 5, ("full" | "upper" | "lower" | "light")[]> = {
      3: ["full", "full", "full"],
      4: ["upper", "lower", "upper", "lower"],
      5: ["upper", "lower", "upper", "lower", "light"],
    };
    const days = locations[preferences.daysPerWeek].map((dayPlace, index) => {
      const available = listExercisesForPreferences(dayPlace, preferences).map(exercise => exercise.id);
      const upper = available.filter(id => /chest|row|pull|pushup/.test(id));
      const lower = available.filter(id => /leg|calf|squat|glute|march/.test(id));
      const light = available.filter(id => /march|calf/.test(id));
      const focus = focusByDay[preferences.daysPerWeek][index];
      // When a joint restriction removes a movement group, use only remaining safe movements.
      // This is a reduced-volume day, not a claim that missing muscle groups were trained.
      const preferred = focus === "upper" ? upper : focus === "lower" ? lower : focus === "light" ? light : available;
      const candidates = preferred.length ? preferred : available;
      if (!candidates.length) {
        throw new Error("لا توجد تمارين آمنة متاحة في " + (dayPlace === "gym" ? "النادي" : "المنزل") + " للقيود المختارة.");
      }
      const offset = (index >= 2 ? 1 : 0) + (preferences.level === "متقدم" ? 2 : preferences.level === "متوسط" ? 1 : 0);
      let ordered = [...candidates.slice(offset % candidates.length), ...candidates.slice(0, offset % candidates.length)];
      if (focus === "full" && upper.length && lower.length) {
        const firstUpper = upper[index % upper.length];
        const firstLower = lower[index % lower.length];
        ordered = [firstUpper, firstLower, ...ordered.filter(id => id !== firstUpper && id !== firstLower)];
      }
      const label = focus === "upper" && preferred.length ? "علوي" :
        focus === "lower" && preferred.length ? "سفلي" :
        focus === "light" && preferred.length ? "نشاط خفيف" : "تمارين آمنة";
      return { id: "day-" + (index + 1) + "-" + (focus === "full" ? "شامل" : label), exerciseIds: ordered.slice(0, prescription.exercisesPerDay) };
    });
    return { id, catalogVersion: EXERCISE_CATALOG_VERSION, templateId: "both-" + preferences.daysPerWeek + "d-" + preferences.level, createdAt, days };
  }
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
