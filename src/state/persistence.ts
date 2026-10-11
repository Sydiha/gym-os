import type { DemoData } from "../domain/types";
import { seed } from "../domain/fixtures";
// Keep the V1.2 demo key. This is deliberately not the V1.6 production data layer.
export const STORE = "gym-os-v1.2-demo";
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object";
const number = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;
const date = (v: unknown) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const record = (v: unknown) =>
  object(v) && typeof v.id === "string" && date(v.date);
export function isDemoData(v: unknown): v is DemoData {
  if (
    !object(v) ||
    !number(v.goal) ||
    v.goal === 0 ||
    !number(v.water) ||
    !object(v.settings)
  )
    return false;
  const meal = (m: unknown) =>
    object(m) &&
    record(m) &&
    typeof m.name === "string" &&
    typeof m.source === "string" &&
    ["calories", "protein", "carbs", "fat"].every((k) => number(m[k]));
  const list = (key: string, valid: (r: unknown) => boolean) =>
    Array.isArray(v[key]) && v[key].every(valid);
  const s = v.settings;
  return (
    list("meals", meal) &&
    list("favorites", meal) &&
    list(
      "activities",
      (a) =>
        object(a) &&
        record(a) &&
        typeof a.type === "string" &&
        number(a.minutes) &&
        (a.distance === null || number(a.distance)),
    ) &&
    list("weights", (w) => object(w) && record(w) && number(w.kg)) &&
    list(
      "homeSessions",
      (h) =>
        object(h) &&
        record(h) &&
        number(h.minutes) &&
        number(h.planned) &&
        number(h.skipped),
    ) &&
    ["homeSuggestions", "knee", "shoulder"].every(
      (k) => typeof s[k] === "boolean",
    ) &&
    ["مبتدئ", "متوسط", "متقدم"].includes(String(s.level)) &&
    ["18:00", "none"].includes(String(s.expected)) &&
    ["activity", "rest"].includes(String(s.dayType)) &&
    (v.declinedDate === null || date(v.declinedDate))
  );
}
export function loadDemo(): DemoData {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(STORE) ?? "null");
    if (isDemoData(data)) return data;
  } catch {
    /* Storage may be disabled; keep demo usable. */
  }
  return seed();
}
export function saveDemo(data: DemoData): boolean {
  try {
    localStorage.setItem(STORE, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
