import { expect, test } from "@playwright/test";

test("meal and calories move to history after midnight while nutrition stays open", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-13T23:59:40") });
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التغذية" }).click();
  await page.getByRole("button", { name: "سجّل وجبة" }).click();
  await page.getByLabel("اسم الوجبة").fill("وجبة قبل منتصف الليل");
  await page.getByLabel("السعرات (سعرة)").fill("420");
  await page.getByLabel("بروتين (غ)").fill("25");
  await page.getByLabel("كربوهيدرات (غ)").fill("30");
  await page.getByLabel("دهون (غ)").fill("15");
  await page.getByRole("button", { name: "حفظ الوجبة" }).click();
  await expect(page.locator(".cal-head")).toContainText("٤٢٠");
  await expect(page.getByText("وجبة قبل منتصف الليل")).toBeVisible();

  await page.clock.fastForward("00:00:50");
  await expect(page.locator(".cal-used")).toContainText("٠");
  await expect(page.getByText("لم تسجّل وجبة اليوم.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "سجل الوجبات السابقة" })).toBeVisible();
  await expect(page.getByText("وجبة قبل منتصف الليل")).toBeVisible();
});
