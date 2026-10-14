import { expect, test } from "@playwright/test";

test("training level changes displayed prescription and preserves saved plan level", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  const level = page.locator("#training-level");
  await expect(page.getByText(/خطة مبتدئ: حتى 3 تمارين/)).toBeVisible();
  await level.selectOption("متوسط");
  await expect(page.getByText(/خطة متوسط: حتى 4 تمارين/)).toBeVisible();
  await level.selectOption("متقدم");
  await expect(page.getByText(/خطة متقدم: حتى 5 تمارين/)).toBeVisible();
  await level.selectOption("مبتدئ");
  await page.getByRole("button", { name: "إنشاء جدول وحفظه" }).click();
  await expect(page.getByText(/المستوى عند إنشاء الجدول: مبتدئ/)).toBeVisible();
  await level.selectOption("متقدم");
  await expect(page.getByText(/المستوى عند إنشاء الجدول: مبتدئ/)).toBeVisible();
  await page.getByRole("button", { name: "ابدأ هذا اليوم" }).first().click();
  await expect(page.getByText(/توجيه خطة مبتدئ: 2 مجموعات/)).toBeVisible();
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await expect(page.getByText(/توجيه خطة مبتدئ: 2 مجموعات/)).toBeVisible();
});
