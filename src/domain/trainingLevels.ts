import type { Settings } from "./types";

export type TrainingLevel = Settings["level"];
export interface TrainingPrescription {
  exercisesPerDay: number;
  setsPerExercise: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  instruction: string;
}

const prescriptions: Record<TrainingLevel, TrainingPrescription> = {
  "مبتدئ": {
    exercisesPerDay: 3, setsPerExercise: 2, repsMin: 8, repsMax: 12, restSeconds: 90,
    instruction: "ابدأ بوزن خفيف يمكنك التحكم به، وتعلّم ضبط الجهاز والوضعية أولًا. اترك تكرارين أو أكثر قبل الإجهاد.",
  },
  "متوسط": {
    exercisesPerDay: 4, setsPerExercise: 3, repsMin: 8, repsMax: 12, restSeconds: 90,
    instruction: "حافظ على المدى الحركي والتحكم. إذا أنهيت جميع المجموعات بسهولة وبأسلوب صحيح في جلستين، فكّر بزيادة صغيرة في الوزن.",
  },
  "متقدم": {
    exercisesPerDay: 5, setsPerExercise: 4, repsMin: 6, repsMax: 10, restSeconds: 120,
    instruction: "وزّع الجهد على المجموعات وراقب الاستشفاء. لا ترفع الوزن على حساب التقنية، وخفّف الحمل عند تراجع الأداء.",
  },
};

export const trainingPrescription = (level: TrainingLevel): TrainingPrescription => prescriptions[level];

export function levelFromPlanTemplate(templateId: string | undefined, fallback: TrainingLevel): TrainingLevel {
  if (templateId?.endsWith("-مبتدئ")) return "مبتدئ";
  if (templateId?.endsWith("-متوسط")) return "متوسط";
  if (templateId?.endsWith("-متقدم")) return "متقدم";
  return fallback;
}
