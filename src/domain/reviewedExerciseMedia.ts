import { EXERCISES } from "./exerciseCatalog";

/**
 * Only publish reviewed, locally bundled exercise photographs.
 * Generated mockups, unverified technique photos, external URLs and
 * schematic placeholders must never be displayed as instruction.
 */
export type ReviewedExerciseMedia = {
  exerciseId: string;
  localPath: `/exercises/reviewed/${string}.webp`;
  equipmentVerified: true;
  postureVerified: true;
  reviewedBy: string;
  reviewDate: string;
  altAr: string;
  steps?: readonly { localPath: `/exercises/reviewed/${string}.webp`; altAr: string }[];
  mistakes?: readonly ({ localPath: `/exercises/reviewed/${string}.webp`; altAr: string } | undefined)[];
};

/** Keep empty until each image passes manual technique and visual review. */
export const REVIEWED_EXERCISE_MEDIA: readonly ReviewedExerciseMedia[] = [
  {
    exerciseId: "gym-leg-press",
    localPath: "/exercises/reviewed/gym-leg-press.webp",
    equipmentVerified: true,
    postureVerified: true,
    reviewedBy: "Owner visual approval (not professional technique certification)",
    reviewDate: "2026-10-12",
    altAr: "صورة توضيحية لشخص يستخدم جهاز ضغط الأرجل في وضعية الجلوس مع القدمين على المنصة",
    steps: [{ localPath: "/exercises/reviewed/gym-leg-press.webp", altAr: "وضعية الجلوس على جهاز ضغط الأرجل والقدمين على المنصة" }],
    mistakes: [
      undefined,
      { localPath: "/exercises/reviewed/gym-leg-press-knee-lock.webp", altAr: "مثال توضيحي للتحذير من مد الركبتين حتى القفل" },
    ],
  },
];

export function getReviewedExerciseMedia(exerciseId: string): ReviewedExerciseMedia | undefined {
  return REVIEWED_EXERCISE_MEDIA.find(
    media => media.exerciseId === exerciseId && EXERCISES.some(exercise => exercise.id === media.exerciseId)
  );
}
