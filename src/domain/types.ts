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
export type TrainingPlace = "gym" | "home" | "both";
export interface TrainingPreferences {
  place: TrainingPlace;
  daysPerWeek: 3 | 4 | 5;
  level: Settings["level"];
  knee: boolean;
  shoulder: boolean;
}
export interface TrainingSet { reps: number; loadKg: number | null }
export interface TrainingExerciseLog { exerciseId: string; skipped: boolean; sets: TrainingSet[] }
export interface TrainingSession {
  id: string;
  planId: string | null;
  date: string;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  endedAt: string | null;
  confirmedMinutes: number | null;
  exercises: TrainingExerciseLog[];
}
export interface TrainingPlanDay { id: string; exerciseIds: string[] }
export interface TrainingPlan {
  id: string;
  catalogVersion: number;
  templateId: string;
  createdAt: string;
  days: TrainingPlanDay[];
}
export interface TrainingData {
  preferences: TrainingPreferences | null;
  plans: TrainingPlan[];
  sessions: TrainingSession[];
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
  /** Optional only for legacy v1 snapshots; upgraded snapshots always contain training. */
  training?: TrainingData;
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
