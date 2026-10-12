import { expect, test } from "@playwright/test";

test("training library is visible and workout survives reload", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await expect(page.getByRole("heading", { name: "مكتبة التمارين (12)" })).toBeVisible();
  await page.getByRole("button", { name: "إنشاء جدول وحفظه" }).click();
  await expect(page.getByText("الجدول المحفوظ")).toBeVisible();
  await page.getByRole("button", { name: "ابدأ هذا اليوم" }).first().click();
  await expect(page.getByRole("heading", { name: "التمرين الجاري" })).toBeVisible();
  await page.getByRole("button", { name: "سجّل 10 تكرارات" }).first().click();
  await expect(page.getByText("المجموعات المسجلة: 1").first()).toBeVisible();
  await page.getByRole("button", { name: "إنهاء التمرين وحفظه" }).click();
  await expect(page.getByRole("heading", { name: "التمرين الجاري" })).toHaveCount(0);
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await expect(page.getByText("الجدول المحفوظ")).toBeVisible();
});
