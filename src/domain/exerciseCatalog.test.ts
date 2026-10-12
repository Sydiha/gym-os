import { describe, expect, it } from "vitest";
import { EXERCISES, EXERCISE_CATALOG_VERSION, getExercise, listExercises, listExercisesForPreferences } from "./exerciseCatalog";

describe("offline Arabic exercise catalog", () => {
  it("uses stable unique IDs and a positive catalog version", () => {
    expect(EXERCISE_CATALOG_VERSION).toBe(1);
    expect(new Set(EXERCISES.map(e => e.id)).size).toBe(EXERCISES.length);
    expect(EXERCISES.length).toBeGreaterThanOrEqual(12);
  });
  it("provides Arabic instructions and beginner mistakes for every exercise", () => {
    for (const e of EXERCISES) {
      expect(e.nameAr.length).toBeGreaterThan(3);
      expect(e.equipmentAr.length).toBeGreaterThan(2);
      expect(e.primaryMusclesAr.length).toBeGreaterThan(0);
      expect(e.stepsAr.length).toBeGreaterThanOrEqual(3);
      expect(e.mistakesAr.length).toBeGreaterThanOrEqual(2);
      expect(e.restrictions.every(r => r === "knee" || r === "shoulder")).toBe(true);
      if (e.easierAlternativeId !== null) {
        expect(e.easierAlternativeId).not.toBe(e.id);
        expect(getExercise(e.easierAlternativeId)).toBeDefined();
      }
    }
  });
  it("conservatively excludes joint-caution exercises", () => {
    for (const place of ["gym", "home"] as const) {
      const safe = listExercisesForPreferences(place, { knee: true, shoulder: true });
      expect(safe.length).toBeGreaterThan(0);
      expect(safe.every(e => e.restrictions.length === 0)).toBe(true);
      expect(listExercisesForPreferences(place, { knee: false, shoulder: false })).toEqual(listExercises(place));
    }
  });
  it("covers gym machines and home exercises without modifying records", () => {
    expect(listExercises("gym").length).toBeGreaterThan(0);
    expect(listExercises("home").length).toBeGreaterThan(0);
    expect(listExercises().length).toBe(EXERCISES.length);
    expect(getExercise("missing")).toBeUndefined();
  });
});
