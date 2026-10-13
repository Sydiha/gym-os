import { describe, expect, it } from "vitest";
import type { TrainingSession } from "./types";
import { recentExerciseComparison } from "./exerciseComparison";

function session(id: string, status: TrainingSession["status"], date: string, sets: { reps: number; loadKg: number | null }[]): TrainingSession {
  return {
    id, planId: "plan", date, status, startedAt: date + "T10:00:00Z",
    endedAt: status === "completed" ? date + "T11:00:00Z" : null,
    confirmedMinutes: status === "completed" ? 60 : null,
    exercises: [{ exerciseId: "gym-leg-curl", skipped: false, sets }],
  };
}

describe("completed session exercise comparison", () => {
  it("uses two latest completed sessions and ignores in-progress or empty sessions", () => {
    const sessions = [
      session("old", "completed", "2026-10-01", [{ reps: 8, loadKg: 20 }]),
      session("active", "in_progress", "2026-10-13", [{ reps: 20, loadKg: 100 }]),
      session("empty", "completed", "2026-10-12", []),
      session("new", "completed", "2026-10-10", [{ reps: 10, loadKg: null }, { reps: 6, loadKg: 25 }]),
    ];
    expect(recentExerciseComparison(sessions, "gym-leg-curl")).toEqual({
      latest: { date: "2026-10-10", maxReps: 10, maxLoadKg: 25, setCount: 2 },
      previous: { date: "2026-10-01", maxReps: 8, maxLoadKg: 20, setCount: 1 },
    });
    expect(recentExerciseComparison(sessions, "gym-leg-press")).toBeNull();
  });
  it("requires two comparable exercise sessions and never treats missing weight as zero", () => {
    expect(recentExerciseComparison([session("a", "completed", "2026-10-11", [{ reps: 8, loadKg: null }])], "gym-leg-curl")).toBeNull();
    const result = recentExerciseComparison([
      session("a", "completed", "2026-10-11", [{ reps: 8, loadKg: null }]),
      session("b", "completed", "2026-10-10", [{ reps: 9, loadKg: null }]),
    ], "gym-leg-curl");
    expect(result?.latest.maxLoadKg).toBeNull();
    expect(result?.previous.maxLoadKg).toBeNull();
  });
});
