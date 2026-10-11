import type { DemoData } from "./types";
import { day } from "./rules";
export const seed = (): DemoData => ({
  goal: 2100,
  water: 3,
  meals: [
    {
      id: "seed-meal",
      name: "وجبة تجريبية أولية",
      calories: 1420,
      protein: 55,
      carbs: 150,
      fat: 48,
      source: "بيانات عرض تجريبية غير موثقة",
      date: day(),
    },
  ],
  favorites: [],
  activities: [
    { id: "a1", type: "مشي", minutes: 30, distance: 2.1, date: day(-5) },
    { id: "a2", type: "مشي", minutes: 24, distance: null, date: day(-3) },
    { id: "a3", type: "جري", minutes: 18, distance: 2.5, date: day(-1) },
  ],
  weights: [{ id: "w1", kg: 100, date: day(-2) }],
  homeSessions: [],
  settings: {
    homeSuggestions: true,
    knee: false,
    shoulder: false,
    level: "مبتدئ",
    expected: "18:00",
    dayType: "activity",
  },
  declinedDate: null,
});

export function emptyDemo(): DemoData {
  const data = seed();
  return {
    ...data,
    water: 0,
    meals: [],
    favorites: [],
    activities: [],
    weights: [],
    homeSessions: [],
  };
}
export function emptyPersonal(): DemoData {
  const data = emptyDemo();
  return {
    ...data,
    goal: 0,
    settings: { ...data.settings, expected: "none", dayType: "activity" },
  };
}
export const restaurantOptions = [
  {
    name: "ساندويتش دجاج مشوي مع سلطة",
    calories: 560,
    protein: 38,
    carbs: 55,
    fat: 20,
  },
  {
    name: "طبق أرز ودجاج مع خضار",
    calories: 760,
    protein: 44,
    carbs: 88,
    fat: 25,
  },
  {
    name: "برغر مفرد مع بطاطس صغيرة",
    calories: 890,
    protein: 34,
    carbs: 96,
    fat: 41,
  },
];
