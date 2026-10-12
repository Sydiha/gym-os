import type { DemoData, TrainingData } from "../domain/types";

const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;
const ids = (items: { id: string }[]) => new Set(items.map(x => x.id)).size === items.length;
const timestamp = (v: unknown) => str(v) && Number.isFinite(Date.parse(v));
const date = (v: unknown) => str(v) && /^\d{4}-\d{2}-\d{2}$/.test(v);
export const emptyTraining = (): TrainingData => ({ preferences: null, plans: [], sessions: [] });

export function isTrainingData(v: unknown): v is TrainingData {
  if (!obj(v) || !Array.isArray(v.plans) || !Array.isArray(v.sessions)) return false;
  const p = v.preferences;
  if (p !== null && (!obj(p) || !["gym", "home", "both"].includes(String(p.place)) ||
    ![3, 4, 5].includes(Number(p.daysPerWeek)) || !["مبتدئ", "متوسط", "متقدم"].includes(String(p.level)) ||
    typeof p.knee !== "boolean" || typeof p.shoulder !== "boolean")) return false;
  const validPlan = (plan: unknown) => obj(plan) && str(plan.id) && num(plan.catalogVersion) &&
    Number.isInteger(plan.catalogVersion) && str(plan.templateId) && timestamp(plan.createdAt) &&
    Array.isArray(plan.days) && plan.days.every((d: unknown) => obj(d) && str(d.id) &&
      Array.isArray(d.exerciseIds) && d.exerciseIds.every(str) && new Set(d.exerciseIds).size === d.exerciseIds.length) &&
    ids(plan.days as { id: string }[]);
  const validSession = (s: unknown) => obj(s) && str(s.id) &&
    (s.planId === null || str(s.planId)) && date(s.date) &&
    ["in_progress", "completed", "abandoned"].includes(String(s.status)) &&
    timestamp(s.startedAt) && (s.endedAt === null || timestamp(s.endedAt)) &&
    (s.confirmedMinutes === null || num(s.confirmedMinutes)) &&
    Array.isArray(s.exercises) && s.exercises.every((e: unknown) => obj(e) &&
      str(e.exerciseId) && typeof e.skipped === "boolean" && Array.isArray(e.sets) &&
      e.sets.every((set: unknown) => obj(set) && num(set.reps) &&
        Number.isInteger(set.reps) && (set.loadKg === null || num(set.loadKg)))) &&
    new Set(s.exercises.map((e: { exerciseId: string }) => e.exerciseId)).size === s.exercises.length;
  return v.plans.every(validPlan) && v.sessions.every(validSession) &&
    ids(v.plans as { id: string }[]) && ids(v.sessions as { id: string }[]);
}

/** Pure, idempotent; never mutates or silently replaces invalid training data. */
export function upgradePersonalData<T extends DemoData>(data: T): T & { training: TrainingData } {
  if (data.training !== undefined && !isTrainingData(data.training)) throw new Error("Invalid training data");
  return { ...structuredClone(data), training: data.training === undefined ? emptyTraining() : structuredClone(data.training) };
}
