import { expect, test } from "@playwright/test";

test("daily meal and completed gym workout survive app reopen independently", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);

  await page.getByRole("navigation").getByRole("button", { name: "التغذية" }).click();
  await page.getByRole("button", { name: "سجّل وجبة" }).click();
  await page.getByLabel("اسم الوجبة").fill("غداء الاختبار اليومي");
  await page.getByLabel("السعرات (سعرة)").fill("650");
  await page.getByLabel("بروتين (غ)").fill("42");
  await page.getByLabel("كربوهيدرات (غ)").fill("68");
  await page.getByLabel("دهون (غ)").fill("19");
  await page.getByRole("button", { name: "حفظ الوجبة" }).click();
  await expect(page.getByText("غداء الاختبار اليومي")).toBeVisible();
  await expect(page.getByText(/جارٍ حفظ بياناتك/)).toHaveCount(0);

  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await page.getByRole("button", { name: "إنشاء جدول وحفظه" }).click();
  await expect(page.getByText("الجدول المحفوظ")).toBeVisible();
  await page.getByRole("button", { name: "ابدأ هذا اليوم" }).first().click();
  await page.getByLabel(/التكرارات —/).first().fill("9");
  await page.getByLabel(/الوزن بالكيلو \(اختياري\) —/).first().fill("15");
  await page.getByRole("button", { name: "تسجيل مجموعة" }).first().click();
  await expect(page.getByText("9 تكرارات، 15 كجم")).toBeVisible();
  await page.getByRole("button", { name: "إنهاء التمرين وحفظه" }).click();
  await expect(page.getByRole("heading", { name: "سجل التمارين المكتملة (1)" })).toBeVisible();
  await expect(page.getByText(/جارٍ حفظ بياناتك/)).toHaveCount(0);

  await page.reload();
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التغذية" }).click();
  await expect(page.getByText("غداء الاختبار اليومي")).toBeVisible();
  await expect(page.getByText(/650 سعرة/)).toBeVisible();
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  const history = page.getByRole("region", { name: "سجل التمارين المكتملة" });
  await expect(history.getByRole("heading", { name: "سجل التمارين المكتملة (1)" })).toBeVisible();
  await history.locator("summary").first().click();
  await expect(history.getByText("9 تكرارات، 15 كجم")).toBeVisible();
  await expect(page.getByRole("heading", { name: "التمرين الجاري" })).toHaveCount(0);
});
