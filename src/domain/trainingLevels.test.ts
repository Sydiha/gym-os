import { describe, expect, it } from "vitest";
import { generateTrainingPlan } from "./trainingPlan";
import { trainingPrescription, levelFromPlanTemplate } from "./trainingLevels";
import { getExercise } from "./exerciseCatalog";
import type { TrainingPreferences } from "./types";

const build = (level: TrainingPreferences["level"], overrides: Partial<TrainingPreferences> = {}) => {
  const preferences: TrainingPreferences = {
    level, place: "gym", daysPerWeek: 3, knee: false, shoulder: false, ...overrides,
  };
  return generateTrainingPlan(preferences, "example", "2026-10-14T09:00:00.000Z");
};

describe("training levels", () => {
  it("offers distinct prescriptions for volume, reps and rest", () => {
    const beginner = trainingPrescription("مبتدئ");
    const intermediate = trainingPrescription("متوسط");
    const advanced = trainingPrescription("متقدم");
    expect([beginner.setsPerExercise, intermediate.setsPerExercise, advanced.setsPerExercise]).toEqual([2, 3, 4]);
    expect([beginner.exercisesPerDay, intermediate.exercisesPerDay, advanced.exercisesPerDay]).toEqual([3, 4, 5]);
    expect(advanced.restSeconds).toBeGreaterThan(beginner.restSeconds);
    expect(advanced.repsMin).toBeLessThan(beginner.repsMin);
  });

  it("generates genuinely different plans by level rather than names alone", () => {
    const beginner = build("مبتدئ");
    const intermediate = build("متوسط");
    const advanced = build("متقدم");
    expect(beginner.days).toHaveLength(3);
    expect(beginner.days[0].exerciseIds).toHaveLength(3);
    expect(intermediate.days[0].exerciseIds).toHaveLength(4);
    expect(advanced.days[0].exerciseIds).toHaveLength(5);
    expect(beginner.days[0].exerciseIds).not.toEqual(intermediate.days[0].exerciseIds);
    expect(intermediate.days[0].exerciseIds).not.toEqual(advanced.days[0].exerciseIds);
  });

  it("respects joint restrictions at every level and keeps chosen number of days", () => {
    for (const level of ["مبتدئ", "متوسط", "متقدم"] as const) {
      for (const daysPerWeek of [3, 4, 5] as const) {
        const plan = build(level, { place: "home", daysPerWeek, knee: true, shoulder: true });
        expect(plan.days).toHaveLength(daysPerWeek);
        for (const day of plan.days) {
          expect(day.exerciseIds.length).toBeGreaterThan(0);
          expect(day.exerciseIds.length).toBeLessThanOrEqual(trainingPrescription(level).exercisesPerDay);
          for (const id of day.exerciseIds) {
            expect(getExercise(id)?.restrictions).toEqual([]);
          }
        }
      }
    }
  });

  it("recovers the original level for saved plans even after changing settings", () => {
    const beginner = build("مبتدئ");
    expect(levelFromPlanTemplate(beginner.templateId, "متقدم")).toBe("مبتدئ");
    expect(levelFromPlanTemplate("old-template", "متوسط")).toBe("متوسط");
  });
});
