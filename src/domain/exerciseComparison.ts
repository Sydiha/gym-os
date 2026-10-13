import type { TrainingSession } from "./types";

export type ExerciseSnapshot = {
  date: string;
  maxReps: number;
  maxLoadKg: number | null;
  setCount: number;
};

export function recentExerciseComparison(sessions: readonly TrainingSession[], exerciseId: string): { latest: ExerciseSnapshot; previous: ExerciseSnapshot } | null {
  const matches = sessions
    .filter(s => s.status === "completed")
    .map(s => ({ session: s, exercise: s.exercises.find(e => e.exerciseId === exerciseId) }))
    .filter(item => item.exercise && item.exercise.sets.length > 0)
    .sort((a, b) => (b.session.endedAt ?? b.session.startedAt).localeCompare(a.session.endedAt ?? a.session.startedAt))
    .slice(0, 2);
  if (matches.length < 2) return null;
  const summarize = (item: typeof matches[number]): ExerciseSnapshot => {
    const sets = item.exercise!.sets;
    const recordedLoads = sets.map(set => set.loadKg).filter((kg): kg is number => kg !== null);
    return {
      date: item.session.date,
      maxReps: Math.max(...sets.map(set => set.reps)),
      maxLoadKg: recordedLoads.length ? Math.max(...recordedLoads) : null,
      setCount: sets.length,
    };
  };
  return { latest: summarize(matches[0]), previous: summarize(matches[1]) };
}
