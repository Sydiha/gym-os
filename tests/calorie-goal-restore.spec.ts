import { expect, test } from "@playwright/test";

test("restoring backup updates visible calorie goal while profile stays open", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  const goal = page.getByLabel("هدف السعرات اليومي (اختياري)");
  await goal.fill("2100");
  await goal.press("Enter");
  await expect(goal).toHaveValue("2100");

  const backup = {
    schemaVersion: 2, exportedAt: "2026-10-13T09:00:00.000Z",
    data: {
      goal: 1800, water: 0, meals: [], favorites: [], activities: [], weights: [],
      homeSessions: [],
      settings: { homeSuggestions: true, knee: false, shoulder: false, level: "مبتدئ", expected: "none", dayType: "activity" },
      declinedDate: null,
      training: { preferences: null, plans: [], sessions: [] },
    },
  };
  page.once("dialog", dialog => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: "goal-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.getByText("استُعيدت النسخة الاحتياطية بنجاح.")).toBeVisible();
  await expect(goal).toHaveValue("1800");
  await page.getByRole("button", { name: "إغلاق" }).click();
  await expect(page.locator(".cal-head")).toContainText("١٬٨٠٠");
});
