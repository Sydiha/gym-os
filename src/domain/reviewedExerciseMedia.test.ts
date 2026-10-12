import { describe, expect, it } from "vitest";
import { EXERCISES } from "./exerciseCatalog";
import { REVIEWED_EXERCISE_MEDIA, getReviewedExerciseMedia } from "./reviewedExerciseMedia";

describe("reviewed exercise photos", () => {
  it("does not display unapproved images", () => {
    for (const exercise of EXERCISES) {
      const photo = getReviewedExerciseMedia(exercise.id);
      if (!photo) continue;
      expect(photo.equipmentVerified).toBe(true);
      expect(photo.postureVerified).toBe(true);
      expect(photo.reviewedBy.trim().length).toBeGreaterThan(0);
      expect(photo.reviewDate).toMatch(/^\\d{4}-\\d{2}-\\d{2}$/);
      expect(photo.altAr.trim().length).toBeGreaterThan(5);
      expect(photo.localPath).toMatch(/^\\/exercises\\/reviewed\\/[a-z0-9-]+\\.webp$/);
      expect(photo.localPath).not.toMatch(/^https?:/);
    }
  });
  it("prevents unknown IDs, duplicate IDs and duplicate media paths", () => {
    expect(new Set(REVIEWED_EXERCISE_MEDIA.map(m => m.exerciseId)).size).toBe(REVIEWED_EXERCISE_MEDIA.length);
    expect(new Set(REVIEWED_EXERCISE_MEDIA.map(m => m.localPath)).size).toBe(REVIEWED_EXERCISE_MEDIA.length);
    for (const m of REVIEWED_EXERCISE_MEDIA) expect(EXERCISES.some(e => e.id === m.exerciseId)).toBe(true);
  });
});
