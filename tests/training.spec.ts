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
  await page.getByLabel(/التكرارات —/).first().fill("8");
  await page.getByLabel(/الوزن بالكيلو \(اختياري\) —/).first().fill("12.5");
  await page.getByRole("button", { name: "تسجيل مجموعة" }).first().click();
  await expect(page.getByText("8 تكرارات، 12.5 كجم")).toBeVisible();
  await expect(page.getByText("المجموعات المسجلة: 1").first()).toBeVisible();
  await page.getByRole("button", { name: "إنهاء التمرين وحفظه" }).click();
  await expect(page.getByRole("heading", { name: "التمرين الجاري" })).toHaveCount(0);
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await expect(page.getByText("الجدول المحفوظ")).toBeVisible();
});

test("saved training preferences are restored after page reload", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await page.getByLabel("مكان التمرين").selectOption("home");
  await page.getByLabel("عدد الأيام").selectOption("4");
  await page.getByLabel("المستوى").selectOption({ label: "متوسط" });
  await page.getByRole("button", { name: "إنشاء جدول وحفظه" }).click();
  await expect(page.getByText("الجدول المحفوظ")).toBeVisible();
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await expect(page.getByLabel("مكان التمرين")).toHaveValue("home");
  await expect(page.getByLabel("عدد الأيام")).toHaveValue("4");
  await expect(page.getByLabel("المستوى")).toHaveValue("متوسط");
});

test("an unfinished workout retains its sets after reload and cannot finish empty", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await page.getByRole("button", { name: "إنشاء جدول وحفظه" }).click();
  await page.getByRole("button", { name: "ابدأ هذا اليوم" }).first().click();
  await expect(page.getByRole("button", { name: "إنهاء التمرين وحفظه" })).toBeDisabled();
  await page.getByLabel(/التكرارات —/).first().fill("9");
  await page.getByRole("button", { name: "تسجيل مجموعة" }).first().click();
  await expect(page.getByText("9 تكرارات، وزن الجسم / غير محدد")).toBeVisible();
  await expect(page.getByRole("button", { name: "إنهاء التمرين وحفظه" })).toBeEnabled();
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await expect(page.getByRole("heading", { name: "التمرين الجاري" })).toBeVisible();
  await expect(page.getByText("9 تكرارات، وزن الجسم / غير محدد")).toBeVisible();
  await expect(page.getByRole("button", { name: "إنهاء التمرين وحفظه" })).toBeEnabled();
});

test("invalid repetitions and load show feedback and cannot record a set", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await page.getByRole("button", { name: "إنشاء جدول وحفظه" }).click();
  await page.getByRole("button", { name: "ابدأ هذا اليوم" }).first().click();
  const record = page.getByRole("button", { name: "تسجيل مجموعة" }).first();
  await page.getByLabel(/التكرارات —/).first().fill("");
  await expect(page.getByText("أدخل عدد تكرارات صحيحًا بين 1 و1000.").first()).toBeVisible();
  await expect(record).toBeDisabled();
  await page.getByLabel(/التكرارات —/).first().fill("10");
  await page.getByLabel(/الوزن بالكيلو \(اختياري\) —/).first().fill("-5");
  await expect(page.getByText("أدخل وزنًا بين 0 و1000 كجم، أو اتركه فارغًا.").first()).toBeVisible();
  await expect(record).toBeDisabled();
  await page.getByLabel(/الوزن بالكيلو \(اختياري\) —/).first().fill("12.5");
  await expect(record).toBeEnabled();
  await record.click();
  await expect(page.getByText("10 تكرارات، 12.5 كجم")).toBeVisible();
});

test("each exercise keeps independent set inputs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await page.locator("#training-level").selectOption("متقدم");
  await page.getByRole("button", { name: "إنشاء جدول وحفظه" }).click();
  await page.getByRole("button", { name: "ابدأ هذا اليوم" }).first().click();
  const entries = page.locator(".training-set-entry");
  await expect(entries).toHaveCount(5);
  await entries.nth(0).locator('input[type="number"]').first().fill("8");
  await entries.nth(0).locator('input[type="number"]').nth(1).fill("30");
  await entries.nth(1).locator('input[type="number"]').first().fill("12");
  await entries.nth(1).locator('input[type="number"]').nth(1).fill("7.5");
  await expect(entries.nth(0).locator('input[type="number"]').nth(1)).toHaveValue("30");
  await entries.nth(1).getByRole("button", { name: "تسجيل مجموعة" }).click();
  await expect(page.getByText("12 تكرارات، 7.5 كجم")).toBeVisible();
  await entries.nth(0).getByRole("button", { name: "تسجيل مجموعة" }).click();
  await expect(page.getByText("8 تكرارات، 30 كجم")).toBeVisible();
});

test("recorded sets can be edited and deleted without affecting another exercise", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await page.getByRole("button", { name: "إنشاء جدول وحفظه" }).click();
  await page.getByRole("button", { name: "ابدأ هذا اليوم" }).first().click();
  const entries = page.locator(".training-set-entry");
  await entries.first().getByRole("button", { name: "تسجيل مجموعة" }).click();
  await entries.nth(1).getByRole("button", { name: "تسجيل مجموعة" }).click();
  await page.getByRole("button", { name: /تعديل المجموعة 1 للتمرين/ }).first().click();
  await page.getByLabel("تعديل التكرارات — المجموعة 1").fill("8");
  await page.getByLabel("تعديل الوزن — المجموعة 1").fill("20");
  await page.getByRole("button", { name: "حفظ التعديل" }).click();
  await expect(page.getByText("8 تكرارات، 20 كجم")).toBeVisible();
  await expect(page.getByText("10 تكرارات، وزن الجسم / غير محدد")).toBeVisible();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: /حذف المجموعة 1 للتمرين/ }).first().click();
  await expect(page.getByText("8 تكرارات، 20 كجم")).toHaveCount(0);
  await expect(page.getByText("10 تكرارات، وزن الجسم / غير محدد")).toBeVisible();
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await expect(page.getByText("10 تكرارات، وزن الجسم / غير محدد")).toBeVisible();
  await expect(page.getByText("8 تكرارات، 20 كجم")).toHaveCount(0);
});

test("completed workout history shows recorded sets and survives reload", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await expect(page.getByRole("heading", { name: "سجل التمارين المكتملة (0)" })).toBeVisible();
  await page.getByRole("button", { name: "إنشاء جدول وحفظه" }).click();
  await page.getByRole("button", { name: "ابدأ هذا اليوم" }).first().click();
  await page.getByLabel(/التكرارات —/).first().fill("7");
  await page.getByLabel(/الوزن بالكيلو \(اختياري\) —/).first().fill("22.5");
  await page.getByRole("button", { name: "تسجيل مجموعة" }).first().click();
  await page.getByRole("button", { name: "إنهاء التمرين وحفظه" }).click();
  const history = page.getByRole("region", { name: "سجل التمارين المكتملة" });
  await expect(history.getByRole("heading", { name: "سجل التمارين المكتملة (1)" })).toBeVisible();
  await history.locator("summary").first().click();
  await expect(history.getByText("7 تكرارات، 22.5 كجم")).toBeVisible();
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  const restored = page.getByRole("region", { name: "سجل التمارين المكتملة" });
  await restored.locator("summary").first().click();
  await expect(restored.getByText("7 تكرارات، 22.5 كجم")).toBeVisible();
});

test("comparison section explains when no exercise has two comparable sessions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  await expect(page.getByRole("region", { name: "مقارنة الأداء السابق" })
    .getByText("لا توجد مقارنة متاحة بعد. سجّل جلستين مكتملتين تحتويان على مجموعات للتمرين نفسه.")).toBeVisible();
});
