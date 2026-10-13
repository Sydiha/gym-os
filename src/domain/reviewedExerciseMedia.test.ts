import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
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
      expect(Date.parse(photo.reviewDate)).not.toBeNaN();
      expect(photo.altAr.trim().length).toBeGreaterThan(5);
      expect(photo.localPath.startsWith("/exercises/reviewed/")).toBe(true);
      expect(photo.localPath.endsWith(".webp")).toBe(true);
      expect(photo.localPath).not.toMatch(/^https?:/);
      expect(photo.correct).toBeDefined();
      expect(photo.steps).toHaveLength(3);
      expect(photo.mistakes).toHaveLength(2);
      for (const item of [photo.correct, ...photo.steps, ...photo.mistakes, ...(photo.comparisons ?? [])]) {
        expect(item.localPath).toMatch(/^\/exercises\/reviewed\/[a-z0-9-]+\.webp$/);
        expect(item.altAr.trim().length).toBeGreaterThan(5);
        const itemFile = join(process.cwd(), "public", item.localPath.slice(1));
        expect(existsSync(itemFile), `Missing instructional photo: ${item.localPath}`).toBe(true);
        if (existsSync(itemFile)) expect(statSync(itemFile).size).toBeGreaterThan(1000);
      }
      const file = join(process.cwd(), "public", photo.localPath.slice(1));
      expect(existsSync(file), `Missing local photo: ${photo.localPath}`).toBe(true);
      if (existsSync(file)) expect(statSync(file).size).toBeGreaterThan(1000);
    }
  });
  it("prevents unknown IDs, duplicate IDs and duplicate media paths", () => {
    expect(new Set(REVIEWED_EXERCISE_MEDIA.map(m => m.exerciseId)).size).toBe(REVIEWED_EXERCISE_MEDIA.length);
    expect(REVIEWED_EXERCISE_MEDIA).toHaveLength(EXERCISES.length);
    const allPaths = REVIEWED_EXERCISE_MEDIA.flatMap(m => [m.localPath, m.correct.localPath, ...m.steps.map(x => x.localPath), ...m.mistakes.map(x => x.localPath), ...(m.comparisons ?? []).map(x => x.localPath)]);
    expect(allPaths).toHaveLength(94);
    expect(new Set(allPaths).size).toBe(allPaths.length);
    for (const m of REVIEWED_EXERCISE_MEDIA) expect(EXERCISES.some(e => e.id === m.exerciseId)).toBe(true);
    const comparisons = REVIEWED_EXERCISE_MEDIA.flatMap(m => m.comparisons ?? []);
    expect(comparisons).toHaveLength(10);
    for (const item of comparisons) expect(["من الأمام", "من الخلف", "من الجانب"]).toContain(item.angleAr);
  });
});
