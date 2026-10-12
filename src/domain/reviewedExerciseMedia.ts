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
};

/** Keep empty until each image passes manual technique and visual review. */
export const REVIEWED_EXERCISE_MEDIA: readonly ReviewedExerciseMedia[] = [];

export function getReviewedExerciseMedia(exerciseId: string): ReviewedExerciseMedia | undefined {
  return REVIEWED_EXERCISE_MEDIA.find(
    media => media.exerciseId === exerciseId && EXERCISES.some(exercise => exercise.id === media.exerciseId)
  );
}
