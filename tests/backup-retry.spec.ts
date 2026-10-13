import { expect, test } from "@playwright/test";

test("same backup can be selected after cancelling restore", async ({ page }) => {
  const backup = {
    schemaVersion: 2,
    exportedAt: "2026-10-13T09:00:00.000Z",
    data: {
      goal: 1850, water: 1, meals: [], favorites: [], activities: [], weights: [],
      homeSessions: [],
      settings: { homeSuggestions: true, knee: false, shoulder: false, level: "مبتدئ", expected: "none", dayType: "activity" },
      declinedDate: null,
      training: { preferences: null, plans: [], sessions: [] },
    },
  };
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  const picker = page.locator('input[type="file"]');
  const file = { name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) };
  let confirmations = 0;
  page.once("dialog", dialog => { confirmations++; return dialog.dismiss(); });
  await picker.setInputFiles(file);
  await expect.poll(() => confirmations).toBe(1);
  await expect(picker).toHaveValue("");
  page.once("dialog", dialog => { confirmations++; return dialog.accept(); });
  await picker.setInputFiles(file);
  await expect.poll(() => confirmations).toBe(2);
  await expect(page.getByText("استُعيدت النسخة الاحتياطية بنجاح.")).toBeVisible();
});

test("oversize backup is rejected without opening restore confirmation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  let message = "";
  page.once("dialog", dialog => { message = dialog.message(); return dialog.dismiss(); });
  await page.locator('input[type="file"]').setInputFiles({
    name: "oversize.json", mimeType: "application/json", buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 32),
  });
  await expect.poll(() => message).toContain("10 ميجابايت");
});
