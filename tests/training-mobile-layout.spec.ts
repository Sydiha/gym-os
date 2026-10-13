import { expect, test } from "@playwright/test";

for (const width of [320, 375, 390, 430]) {
  test(`training stays within mobile viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 760 });
    await page.goto("/");
    await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
    await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
    await page.getByRole("button", { name: "إنشاء جدول وحفظه" }).click();
    await page.getByRole("button", { name: "ابدأ هذا اليوم" }).first().click();
    const metrics = await page.evaluate(() => {
      const region = document.querySelector(".training-page");
      if (!region) return null;
      const box = region.getBoundingClientRect();
      const overflowing = [...region.querySelectorAll("input,button,summary,.training-day")]
        .filter(element => {
          const bounds = element.getBoundingClientRect();
          return bounds.right > innerWidth + 1 || bounds.left < -1;
        })
        .map(element => element.tagName + ":" + (element.textContent ?? "").slice(0, 35));
      return { left: box.left, right: box.right, width: innerWidth, overflowing };
    });
    expect(metrics).not.toBeNull();
    expect(metrics!.left).toBeGreaterThanOrEqual(-1);
    expect(metrics!.right).toBeLessThanOrEqual(width + 1);
    expect(metrics!.overflowing).toEqual([]);
  });
}
