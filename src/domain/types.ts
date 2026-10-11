export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
  date: string;
}
export interface Activity {
  id: string;
  type: string;
  minutes: number;
  distance: number | null;
  date: string;
  /** Optional for records created before start-time tracking was introduced. */
  startTime?: string;
}
export interface Weight {
  id: string;
  kg: number;
  date: string;
}
export interface HomeSession {
  id: string;
  date: string;
  minutes: number;
  planned: number;
  skipped: number;
}
export interface Settings {
  homeSuggestions: boolean;
  knee: boolean;
  shoulder: boolean;
  level: "مبتدئ" | "متوسط" | "متقدم";
  expected: "18:00" | "none";
  dayType: "activity" | "rest";
}
export interface DemoData {
  goal: number;
  water: number;
  meals: Meal[];
  favorites: Meal[];
  activities: Activity[];
  weights: Weight[];
  homeSessions: HomeSession[];
  settings: Settings;
  declinedDate: string | null;
}
export type Page = "الرئيسية" | "التغذية" | "النشاط" | "التقدم";
export type Sheet =
  | "meal"
  | "restaurant"
  | "activity"
  | "weight"
  | "plan"
  | "exercise"
  | "finish"
  | "quick"
  | "profile";
export type Nutrient = "calories" | "protein" | "carbs" | "fat";
