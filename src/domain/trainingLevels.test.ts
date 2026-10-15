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

describe("mixed gym and home plans", () => {
  it.each([3, 4, 5] as const)("uses both places with a balanced %i-day schedule", daysPerWeek => {
    const plan = build("مبتدئ", { place: "both", daysPerWeek });
    expect(plan.days).toHaveLength(daysPerWeek);
    const places = plan.days.map(day => [...new Set(day.exerciseIds.map(id => getExercise(id)?.place))]);
    expect(places.flat()).toContain("gym");
    expect(places.flat()).toContain("home");
    expect(places.every(dayPlaces => dayPlaces.length === 1)).toBe(true);
    expect(places[0]).toEqual(["gym"]);
    expect(places[1]).toEqual(["home"]);
    if (daysPerWeek === 3) {
      for (const day of plan.days) {
        expect(day.exerciseIds.some(id => /chest|row|pull|pushup/.test(id))).toBe(true);
        expect(day.exerciseIds.some(id => /leg|calf|squat|glute|march/.test(id))).toBe(true);
      }
    } else {
      expect(plan.days[0].exerciseIds.every(id => /chest|row|pull|pushup/.test(id))).toBe(true);
      expect(plan.days[1].exerciseIds.every(id => /leg|calf|squat|glute|march/.test(id))).toBe(true);
      expect(plan.days[2].exerciseIds.every(id => /chest|row|pull|pushup/.test(id))).toBe(true);
      expect(plan.days[3].exerciseIds.every(id => /leg|calf|squat|glute|march/.test(id))).toBe(true);
      if (daysPerWeek === 5) expect(plan.days[4].exerciseIds.every(id => /march|calf/.test(id))).toBe(true);
    }
  });

  it.each(["مبتدئ", "متوسط", "متقدم"] as const)("respects exercise limits for %s", level => {
    for (const daysPerWeek of [3, 4, 5] as const) {
      const plan = build(level, { place: "both", daysPerWeek });
      expect(plan.days).toHaveLength(daysPerWeek);
      for (const day of plan.days) {
        expect(day.exerciseIds.length).toBeGreaterThan(0);
        expect(day.exerciseIds.length).toBeLessThanOrEqual(trainingPrescription(level).exercisesPerDay);
      }
    }
  });

  it("preserves joint restrictions and requires equipment appropriate to each location", () => {
    for (const daysPerWeek of [3, 4, 5] as const) {
      const plan = build("متوسط", { place: "both", daysPerWeek, knee: true, shoulder: false });
      for (const day of plan.days) {
        const exercises = day.exerciseIds.map(id => getExercise(id)!);
        expect(exercises.every(exercise => !exercise.restrictions.includes("knee"))).toBe(true);
        expect(exercises.every(exercise => exercise.place === exercises[0].place)).toBe(true);
        if (exercises[0].place === "home") {
          expect(exercises.every(exercise => !exercise.equipmentAr.includes("جهاز"))).toBe(true);
        }
      }
    }
  });

  it("fails explicitly when restrictions eliminate a required muscle group", () => {
    for (const daysPerWeek of [3, 4, 5] as const) {
      expect(() => build("مبتدئ", { place: "both", daysPerWeek, shoulder: true }))
        .toThrow(/لا يمكن إنشاء يوم متوازن|لا توجد تمارين مناسبة/);
    }
  });


  it("handles shoulder-only and combined restrictions explicitly", () => {
    for (const daysPerWeek of [3, 4, 5] as const) {
      for (const level of ["مبتدئ", "متوسط", "متقدم"] as const) {
        for (const restrictions of [{ knee: false, shoulder: true }, { knee: true, shoulder: true }]) {
          expect(() => build(level, { place: "both", daysPerWeek, ...restrictions }))
            .toThrow(/لا يمكن إنشاء يوم متوازن|لا توجد تمارين مناسبة/);
        }
      }
    }
  });

  it("uses only equipment declared for the selected location", () => {
    for (const daysPerWeek of [3, 4, 5] as const) {
      for (const level of ["مبتدئ", "متوسط", "متقدم"] as const) {
        const plan = build(level, { place: "both" , daysPerWeek });
        for (const day of plan.days) {
          const exercises = day.exerciseIds.map(id => getExercise(id)!);
          const location = exercises[0].place;
          expect(exercises.every(exercise => exercise.place === location)).toBe(true);
          if (location === "home") {
            expect(exercises.every(exercise => !exercise.equipmentAr.includes("جهاز"))).toBe(true);
          }
        }
      }
    }
  });

  it("keeps existing single-location gym and home generation unchanged", () => {
    for (const place of ["gym", "home"] as const) {
      for (const daysPerWeek of [3, 4, 5] as const) {
        for (const level of ["مبتدئ", "متوسط", "متقدم"] as const) {
          const plan = build(level, { place, daysPerWeek });
          expect(plan.templateId).toBe(place + "-" + daysPerWeek + "d-" + level);
          expect(plan.days).toHaveLength(daysPerWeek);
          expect(plan.days.every(day => day.exerciseIds.every(id => getExercise(id)?.place === place))).toBe(true);
        }
      }
    }
  });
});
