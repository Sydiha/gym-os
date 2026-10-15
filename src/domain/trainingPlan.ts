import type { TrainingPlan, TrainingPreferences } from "./types";
import { trainingPrescription } from "./trainingLevels";
import { EXERCISE_CATALOG_VERSION, listExercisesForPreferences, type ExercisePlace } from "./exerciseCatalog";

export function generateTrainingPlan(preferences: TrainingPreferences, id: string, createdAt: string): TrainingPlan {
  // Mixed plans use location-specific days; single-location plans retain their existing behavior.
  if (preferences.place === "both") {
    const schedule: Record<3 | 4 | 5, { label: string; place: ExercisePlace; focus: "full" | "upper" | "lower" | "light" }[]> = {
      3: [
        { label: "A", place: "gym", focus: "full" },
        { label: "B", place: "home", focus: "full" },
        { label: "A", place: "gym", focus: "full" },
      ],
      4: [
        { label: "علوي A", place: "gym", focus: "upper" },
        { label: "سفلي A", place: "home", focus: "lower" },
        { label: "علوي B", place: "gym", focus: "upper" },
        { label: "سفلي B", place: "home", focus: "lower" },
      ],
      5: [
        { label: "علوي A", place: "gym", focus: "upper" },
        { label: "سفلي A", place: "home", focus: "lower" },
        { label: "علوي B", place: "gym", focus: "upper" },
        { label: "سفلي B", place: "home", focus: "lower" },
        { label: "نشاط خفيف", place: "home", focus: "light" },
      ],
    };
    const prescription = trainingPrescription(preferences.level);
    const days = schedule[preferences.daysPerWeek].map(({ label, place: dayPlace, focus }, index) => {
      const available = listExercisesForPreferences(dayPlace, preferences).map(exercise => exercise.id);
      const lower = available.filter(id => /leg|calf|squat|glute|march/.test(id));
      const upper = available.filter(id => /chest|row|pull|pushup/.test(id));
      const light = available.filter(id => /march|calf/.test(id));
      let candidates: string[];
      if (focus === "full") {
        if (!upper.length || !lower.length) {
          throw new Error("لا يمكن إنشاء يوم متوازن في " + (dayPlace === "gym" ? "النادي" : "المنزل") + " مع القيود المحددة.");
        }
        const pair = index % 2 ? [lower[0], upper[0]] : [upper[0], lower[0]];
        const remaining = available.filter(id => !pair.includes(id));
        const offset = (preferences.level === "متقدم" ? 2 : preferences.level === "متوسط" ? 1 : 0);
        candidates = [...pair, ...remaining.slice(offset % Math.max(1, remaining.length)), ...remaining.slice(0, offset % Math.max(1, remaining.length))];
      } else {
        candidates = focus === "upper" ? upper : focus === "lower" ? lower : light;
        if (candidates.length) {
          const offset = (label.endsWith("B") ? 1 : 0) + (preferences.level === "متقدم" ? 2 : preferences.level === "متوسط" ? 1 : 0);
          candidates = [...candidates.slice(offset % candidates.length), ...candidates.slice(0, offset % candidates.length)];
        }
      }
      if (!candidates.length) {
        throw new Error("لا توجد تمارين مناسبة ليوم " + label + " في " + (dayPlace === "gym" ? "النادي" : "المنزل") + " مع القيود المحددة.");
      }
      return { id: "day-" + (index + 1) + "-" + label, exerciseIds: candidates.slice(0, prescription.exercisesPerDay) };
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
