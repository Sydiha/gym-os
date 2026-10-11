import { describe, expect, it, vi, afterEach } from "vitest";
import { seed, emptyDemo } from "./fixtures";
import {
  day,
  eligible,
  earnedMinutes,
  latestWeight,
  moves,
  nutrient,
  weeklyDays,
  weeklyMinutes,
} from "./rules";
import { isDemoData, loadDemo, saveDemo, STORE } from "../state/persistence";
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
});
describe("V1.2 business rules", () => {
  it("preserves the approved demo totals", () => {
    const d = seed();
    expect(nutrient(d, "calories")).toBe(1420);
    expect(nutrient(d, "protein")).toBe(55);
    expect(weeklyMinutes(d)).toBe(72);
    expect(weeklyDays(d)).toBe(3);
  });
  it("counts only the rolling local seven days and today’s meals", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 2, 10));
    const d = emptyDemo();
    d.activities = [-7, -6, 0, 1].map((n) => ({
      id: String(n),
      date: day(n),
      minutes: 10,
      distance: null,
      type: "مشي",
    }));
    d.meals = [{ ...seed().meals[0], date: day(-1) }];
    expect(weeklyMinutes(d)).toBe(20);
    expect(weeklyDays(d)).toBe(2);
    expect(nutrient(d, "calories")).toBe(0);
  });
  it("preserves strict planned-time and 20:00 unplanned thresholds", () => {
    const d = emptyDemo();
    expect(eligible(d, "17:59")).toBe(false);
    expect(eligible(d, "18:00")).toBe(false);
    expect(eligible(d, "18:01")).toBe(true);
    d.settings.expected = "none";
    expect(eligible(d, "19:59")).toBe(false);
    expect(eligible(d, "20:00")).toBe(true);
  });
  it.each(["rest", "disabled", "declined", "outdoor", "home"])(
    "suppresses suggestions for %s",
    (reason) => {
      const d = emptyDemo();
      if (reason === "rest") d.settings.dayType = "rest";
      if (reason === "disabled") d.settings.homeSuggestions = false;
      if (reason === "declined") d.declinedDate = day();
      if (reason === "outdoor")
        d.activities.push({
          id: "a",
          date: day(),
          minutes: 10,
          distance: null,
          type: "مشي",
        });
      if (reason === "home")
        d.homeSessions.push({
          id: "h",
          date: day(),
          minutes: 5,
          planned: 5,
          skipped: 0,
        });
      expect(eligible(d, "21:00")).toBe(false);
    },
  );
  it("builds 5/10/15 movements and gives combined limitations priority", () => {
    const s = seed().settings;
    for (const n of [5, 10, 15]) expect(moves(s, n)).toHaveLength(n);
    s.knee = true;
    s.shoulder = true;
    s.level = "متقدم";
    const names = moves(s, 5).map((m) => m.name);
    expect(names).toContain("فتح وإغلاق الكفين أثناء الجلوس");
    expect(names).toContain("تحريك الكاحلين أثناء الجلوس");
    expect(names).not.toContain("خطوات جانبية هادئة");
    expect(earnedMinutes(5, [1, 1])).toBe(4);
    expect(earnedMinutes(5, [0, 1, 2, 3, 4])).toBe(0);
  });
  it("shows the latest recorded weight, with no invented trend", () => {
    const d = seed();
    d.weights.push({ id: "new", kg: 99.4, date: day() });
    expect(latestWeight(d)?.kg).toBe(99.4);
    expect(latestWeight(emptyDemo())).toBeUndefined();
  });
});
describe("demo persistence boundary", () => {
  it("round trips V1.2 records and tolerates corrupt data", () => {
    const d = seed();
    expect(saveDemo(d)).toBe(true);
    expect(loadDemo()).toEqual(d);
    localStorage.setItem(STORE, "{");
    expect(loadDemo()).toEqual(seed());
    expect(isDemoData({ ...d, favorites: null })).toBe(false);
    expect(
      isDemoData({ ...d, meals: [{ ...d.meals[0], calories: "bad" }] }),
    ).toBe(false);
  });
  it("keeps the demo available when storage is denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(loadDemo()).toEqual(seed());
    expect(saveDemo(seed())).toBe(false);
  });
});
