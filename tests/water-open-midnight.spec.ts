import { expect, test } from "@playwright/test";

test("water display resets on the next day without a reload", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-13T23:59:40") });
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("button", { name: "+ كوب" }).click();
  await expect(page.getByText("الماء ١ أكواب")).toBeVisible();
  await page.clock.fastForward("00:00:50");
  await expect(page.getByText("الماء ٠ أكواب")).toBeVisible();
  await page.getByRole("button", { name: "+ كوب" }).click();
  await expect(page.getByText("الماء ١ أكواب")).toBeVisible();
});
