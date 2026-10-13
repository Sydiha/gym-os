import { expect, test } from "@playwright/test";

test("nutrition entry controls are enabled after initialization", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التغذية" }).click();
  await expect(page.getByRole("button", { name: "سجّل وجبة" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "ماذا أطلب اليوم؟" })).toBeEnabled();
});
