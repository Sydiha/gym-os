import { expect, test, type Page } from "@playwright/test";
const nav = (p: Page, name: string) =>
  p.getByRole("navigation").getByRole("button", { name, exact: true }).click();
const settings = async (p: Page) => {
  await nav(p, "الرئيسية");
  await p.locator(".demo summary").click();
};
const records = (p: Page) =>
  p.evaluate(() => JSON.parse(localStorage.getItem("gym-os-v1.2-demo")!));
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  await page.getByLabel("وضع الاستخدام").selectOption("demo");
  await page.getByRole("button", { name: "إغلاق" }).click();
});
test("meal, macros, favorites, estimates, water, weight and reload", async ({
  page,
}) => {
  await page.getByRole("button", { name: "+ كوب", exact: true }).click();
  await expect(page.locator(".water")).toContainText("٤");
  await page.getByRole("button", { name: "سجّل وجبة", exact: true }).click();
  await expect(page.locator(".sheet form>.wide")).toHaveCSS("position", "sticky");
  for (const [name, value] of [
    ["name", "غداء"],
    ["calories", "500"],
    ["protein", "30"],
    ["carbs", "50"],
    ["fat", "20"],
  ])
    await page.locator(`[name=${name}]`).fill(value);
  await page.getByRole("button", { name: "حفظ الوجبة" }).click();
  await expect(page.locator(".cal-used")).toContainText("١٬٩٢٠");
  await nav(page, "التغذية");
  await expect(page.locator(".macro-row")).toContainText("٨٥ غ");
  await expect(page.locator(".macro-row")).toContainText("٢٠٠ غ");
  await expect(page.locator(".macro-row")).toContainText("٦٨ غ");
  await page
    .locator(".record")
    .filter({ hasText: "غداء" })
    .getByRole("button", { name: "حفظ", exact: true })
    .click();
  await page.getByRole("button", { name: "ماذا أطلب اليوم؟" }).click();
  await expect(page.getByRole("dialog")).toContainText("تقريبية وغير موثقة");
  await page.getByRole("button", { name: "اختر", exact: true }).first().click();
  await expect(page.locator(".cal-used")).toContainText("٢٬٤٨٠");
  page.once("dialog", (confirmation) => confirmation.accept());
  await page.getByRole("button", { name: "إضافة لليوم" }).click();
  await expect(page.locator(".cal-used")).toContainText("٢٬٩٨٠");
  await nav(page, "التقدم");
  await page.getByRole("button", { name: "سجّل الوزن" }).click();
  await page.locator("[name=kg]").fill("99.4");
  await page.getByRole("button", { name: "حفظ الوزن" }).click();
  await expect(page.locator(".real-weight")).toContainText("٩٩٫٤");
  await page.reload();
  const saved = await records(page);
  expect(saved.water).toBe(4);
  expect(saved.meals).toHaveLength(4);
  expect(saved.favorites).toHaveLength(1);
  expect(saved.weights.at(-1).kg).toBe(99.4);
});
test("walking, running, past cycling and weekly summaries", async ({
  page,
}) => {
  await nav(page, "النشاط");
  for (const [type, minutes, distance, offset] of [
    ["مشي", "20", "", 0],
    ["جري", "15", "2.5", 0],
    ["دراجة", "40", "9.5", -2],
  ] as const) {
    await page
      .getByRole("button", { name: "تسجيل نشاط خارجي", exact: true })
      .click();
    await page.locator("[name=type]").selectOption(type);
    await page.locator("[name=minutes]").fill(minutes);
    await page.locator("[name=distance]").fill(distance);
    const date = await page.evaluate((n) => {
      const d = new Date();
      d.setDate(d.getDate() + n);
      return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-");
    }, offset);
    await page.locator("[name=date]").fill(date);
    await page.getByRole("button", { name: "حفظ النشاط" }).click();
  }
  await expect(page.locator(".stat")).toContainText("١٤٧");
  await nav(page, "التقدم");
  await expect(page.locator(".mini-total")).toContainText("١٤٧");
  await expect(page.locator(".progress-group").first()).toContainText(
    "أيام النشاط: ٥",
  );
  await nav(page, "الرئيسية");
  await expect(
    page.getByRole("button", { name: "جرب تمرين منزلي" }),
  ).toHaveCount(0);
});

test("meal edit, delete, favorites removal, duplicate warning, and numeric boundaries", async ({ page }) => {
  await nav(page, "التغذية");
  await page.getByRole("button", { name: "سجّل وجبة", exact: true }).click();
  for (const [name, value] of [["name", "وجبة إدارة"], ["calories", "400"], ["protein", "20"], ["carbs", "30"], ["fat", "10"]])
    await page.locator(`[name=${name}]`).fill(value);
  await page.getByRole("button", { name: "حفظ الوجبة" }).click();
  await expect(page.locator(".cal-used")).toContainText("١٬٨٢٠");
  const meal = page.locator(".record").filter({ hasText: "وجبة إدارة" }).first();
  await meal.getByRole("button", { name: "حفظ", exact: true }).click();
  await expect(page.getByRole("button", { name: "محفوظة" })).toHaveCount(1);
  await meal.getByRole("button", { name: "تعديل وجبة إدارة" }).click();
  await page.locator("[name=calories]").fill("600");
  await page.locator("[name=protein]").fill("25");
  await page.getByRole("button", { name: "حفظ التعديل" }).click();
  await expect(page.locator(".cal-used")).toContainText("٢٬٠٢٠");

  let duplicateConfirmMessage = "";
  page.once("dialog", async (confirmation) => {
    duplicateConfirmMessage = confirmation.message();
    await confirmation.accept();
  });
  await page.getByRole("button", { name: "إضافة لليوم" }).click();
  expect(duplicateConfirmMessage).toContain("وجبة بالاسم نفسه اليوم");
  page.once("dialog", (confirmation) => confirmation.accept());
  await page.getByRole("button", { name: "إزالة وجبة إدارة من المفضلة" }).click();
  await expect(page.getByRole("button", { name: "تعديل وجبة إدارة" })).toHaveCount(2);
  await page.getByRole("button", { name: "سجّل وجبة", exact: true }).click();
  for (const [name, value] of [["name", "وجبة إدارة"], ["calories", "400"], ["protein", "20"], ["carbs", "30"], ["fat", "10"]])
    await page.locator(`[name=${name}]`).fill(value);
  let duplicateEntryMessage = "";
  page.once("dialog", async (confirmation) => {
    duplicateEntryMessage = confirmation.message();
    await confirmation.accept();
  });
  await page.getByRole("button", { name: "حفظ الوجبة" }).click();
  expect(duplicateEntryMessage).toContain("توجد وجبة بالاسم نفسه");
  await expect(page.getByRole("button", { name: "تعديل وجبة إدارة" })).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    page.once("dialog", (confirmation) => confirmation.accept());
    await page.getByRole("button", { name: "حذف وجبة إدارة" }).first().click();
  }
  await expect(page.getByRole("button", { name: "تعديل وجبة إدارة" })).toHaveCount(0);

  await page.getByRole("button", { name: "سجّل وجبة", exact: true }).click();
  await page.locator("[name=name]").fill("وجبة سالبة");
  await page.locator("[name=calories]").fill("-5");
  await page.getByRole("button", { name: "حفظ الوجبة" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".record").filter({ hasText: "وجبة سالبة" })).toHaveCount(0);
  await page.locator("[name=name]").fill("وجبة صفرية");
  await page.locator("[name=calories]").fill("0");
  await page.getByRole("button", { name: "حفظ الوجبة" }).click();
  await expect(page.locator(".record").filter({ hasText: "وجبة صفرية" })).toContainText("٠ سعرة: قيمة صفرية مدخلة");
});

test("activity time and weight history remain editable and chronological", async ({ page }) => {
  await nav(page, "النشاط");
  await page.getByRole("button", { name: "تسجيل نشاط خارجي", exact: true }).click();
  await expect(page.locator("[name=startTime]")).not.toHaveValue("");
  await page.locator("[name=minutes]").fill("0");
  await page.getByRole("button", { name: "حفظ النشاط" }).click();
  await expect(page.locator("[name=minutes]")).toHaveJSProperty("validationMessage", "أدخل مدة صحيحة أكبر من صفر وحتى ٦٠٠ دقيقة.");
  await page.locator("[name=minutes]").fill("20");
  await page.locator("[name=distance]").fill("0");
  await page.locator("[name=startTime]").fill("08:30");
  await page.locator("[name=date]").fill(await page.evaluate(() => {
    const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }));
  await page.getByRole("button", { name: "حفظ النشاط" }).click();
  const activity = page.locator(".record").filter({ hasText: "٠ كم" });
  await expect(activity).toContainText("٣٠");
  expect((await records(page)).activities.some((item: { distance: number; startTime?: string }) => item.distance === 0 && item.startTime === "08:30")).toBe(true);
  await activity.getByRole("button", { name: "تعديل مشي" }).click();
  await page.locator("[name=minutes]").fill("25");
  await page.getByRole("button", { name: "حفظ التعديل" }).click();
  await expect(page.locator(".record").filter({ hasText: "٢٥ دقيقة" })).toContainText("٣٠");
  page.once("dialog", (confirmation) => confirmation.accept());
  await page.locator(".record").filter({ hasText: "٢٥ دقيقة" }).getByRole("button", { name: "حذف مشي" }).click();
  await expect(page.locator(".record").filter({ hasText: "٢٥ دقيقة" })).toHaveCount(0);

  await nav(page, "التقدم");
  async function addWeight(kg: string, offset: number) {
    await page.getByRole("button", { name: "سجّل الوزن" }).click();
    await page.locator("[name=kg]").fill(kg);
    await page.locator("[name=date]").fill(await page.evaluate((n) => {
      const d = new Date(); d.setDate(d.getDate() + n);
      return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
    }, offset));
    await page.getByRole("button", { name: "حفظ الوزن" }).click();
  }
  await addWeight("99", -1);
  await addWeight("98", -3);
  await expect(page.locator(".real-weight")).toContainText("٩٩");
  const oldWeight = page.locator(".record").filter({ hasText: "٩٨ كجم" });
  await oldWeight.getByRole("button", { name: "تعديل قياس ٩٨ كجم" }).click();
  await page.locator("[name=date]").fill(await page.evaluate(() => {
    const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }));
  await page.getByRole("button", { name: "حفظ التعديل" }).click();
  await expect(page.locator(".real-weight")).toContainText("٩٨");
  page.once("dialog", (confirmation) => confirmation.accept());
  await page.locator(".record").filter({ hasText: "٩٨ كجم" }).getByRole("button", { name: "حذف قياس ٩٨ كجم" }).click();
  await expect(page.locator(".real-weight")).toContainText("٩٩");
});

test("home session editing exposes only fields saved by the home-session model", async ({ page }) => {
  const source = {
    goal: 2100, water: 0, meals: [], favorites: [], activities: [], weights: [],
    homeSessions: [],
    settings: { homeSuggestions: true, knee: false, shoulder: false, level: "مبتدئ", expected: "18:00", dayType: "activity" },
    declinedDate: null,
  };
  const measurementDate = await page.evaluate(() => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  });
  source.homeSessions.push({ id: "home-session", date: measurementDate, minutes: 18, planned: 25, skipped: 7 });
  await page.evaluate((data) => localStorage.setItem("gym-os-v1.2-demo", JSON.stringify(data)), source);
  await page.reload();
  await nav(page, "النشاط");
  const session = page.locator(".record").filter({ hasText: "منزلي" });
  await session.getByRole("button", { name: "تعديل منزلي" }).click();
  await expect(page.locator("[name=minutes]")).toHaveValue("18");
  await expect(page.locator("[name=date]")).toHaveValue(measurementDate);
  await expect(page.locator("[name=type]")).toHaveCount(0);
  await expect(page.locator("[name=distance]")).toHaveCount(0);
  await expect(page.locator("[name=startTime]")).toHaveCount(0);
  await page.locator("[name=minutes]").fill("20");
  await page.getByRole("button", { name: "حفظ التعديل" }).click();
  const saved = await records(page);
  expect(saved.homeSessions).toEqual([{ id: "home-session", date: measurementDate, minutes: 20, planned: 25, skipped: 7 }]);
});

test("Plan B timing, rest, disable, decline and combined limitations", async ({
  page,
}) => {
  await settings(page);
  await page.locator("#clock").fill("18:00");
  await expect(
    page.getByRole("button", { name: "جرب تمرين منزلي" }),
  ).toHaveCount(0);
  await page.locator("#clock").fill("18:01");
  await expect(
    page.getByRole("button", { name: "جرب تمرين منزلي" }),
  ).toBeVisible();
  await page.locator("#expected").focus();
  await page.locator("#expected").selectOption("none");
  await expect(page.locator(".demo")).toHaveAttribute("open", "");
  await expect(page.locator("#expected")).toBeFocused();
  await page.locator("#clock").fill("19:00");
  await expect(
    page.getByRole("button", { name: "جرب تمرين منزلي" }),
  ).toHaveCount(0);
  await page.locator("#clock").fill("21:00");
  await page.locator("#dayType").selectOption("rest");
  await expect(page.getByText("يوم راحة وتعافٍ")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "جرب تمرين منزلي" }),
  ).toHaveCount(0);
  await page.locator("#dayType").selectOption("activity");
  await page.locator("#demo-homeSuggestions").uncheck();
  await expect(
    page.getByRole("button", { name: "جرب تمرين منزلي" }),
  ).toHaveCount(0);
  await page.locator("#demo-homeSuggestions").check();
  await page.locator("#demo-knee").check();
  await page.locator("#demo-shoulder").check();
  await page.getByRole("button", { name: "جرب تمرين منزلي" }).click();
  await expect(page.locator(".moves")).toContainText(
    "فتح وإغلاق الكفين أثناء الجلوس",
  );
  await expect(page.locator(".moves")).toContainText(
    "تحريك الكاحلين أثناء الجلوس",
  );
  await expect(page.locator(".moves")).not.toContainText("خطوات جانبية");
  for (const n of [5, 10, 15]) {
    await page.getByRole("button", { name: `${n} دقائق`, exact: true }).click();
    await expect(page.locator(".moves li")).toHaveCount(n);
  }
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "ليس اليوم" }).click();
  await expect(
    page.getByRole("button", { name: "جرب تمرين منزلي" }),
  ).toHaveCount(0);
  expect((await records(page)).homeSessions).toHaveLength(0);
});
test("Plan B skip/back, no implicit recording, confirmation and persistence", async ({
  page,
}) => {
  await settings(page);
  await page.locator("#clock").fill("21:00");
  await page.getByRole("button", { name: "جرب تمرين منزلي" }).click();
  await page.getByRole("button", { name: "ابدأ الجلسة" }).click();
  await page.getByRole("button", { name: "تخطي هذه الحركة" }).click();
  await page.getByRole("button", { name: "السابق", exact: true }).click();
  await page.getByRole("button", { name: "تخطي هذه الحركة" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "التالي", exact: true }).click();
  await page.getByRole("button", { name: "إنهاء الجلسة" }).click();
  expect((await records(page))?.homeSessions ?? []).toHaveLength(0);
  await page.getByRole("button", { name: /أكملت، سجّل نشاطي/ }).click();
  await expect(page.locator(".mini-total")).toContainText("٧٦");
  expect((await records(page)).homeSessions[0]).toMatchObject({
    minutes: 4,
    skipped: 1,
    planned: 5,
  });
  await page.reload();
  await expect(page.getByText("تم تسجيل جلستك المنزلية")).toBeVisible();
});
test("all skipped and exit do not record; demo reset and restoration persist", async ({
  page,
}) => {
  await settings(page);
  await page
    .getByRole("button", { name: "إعادة ضبط بيانات Demo ومسح التسجيلات" })
    .click();
  await expect(page.locator(".cal-used")).toContainText("٠");
  await expect(page.locator(".water")).toContainText("٠");
  await page.locator("#clock").fill("21:00");
  await page.getByRole("button", { name: "جرب تمرين منزلي" }).click();
  await page.getByRole("button", { name: "ابدأ الجلسة" }).click();
  for (let i = 0; i < 5; i++)
    await page.getByRole("button", { name: "تخطي هذه الحركة" }).click();
  await expect(
    page.getByRole("button", { name: /أكملت، سجّل نشاطي/ }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "خروج دون تسجيل" }).click();
  expect((await records(page)).homeSessions).toHaveLength(0);
  await page.reload();
  await expect(page.locator(".cal-used")).toContainText("٠");
  for (const name of ["التغذية", "النشاط", "التقدم"]) {
    await nav(page, name);
    await expect(page.locator(".empty").first()).toBeVisible();
  }
  await settings(page);
  await page.getByRole("button", { name: "استعادة بيانات العرض" }).click();
  await page.reload();
  await expect(page.locator(".cal-used")).toContainText("١٬٤٢٠");
  await expect(page.locator(".mini-total")).toContainText("٧٢");
});
for (const [width, height] of [
  [375, 812],
  [390, 844],
  [430, 932],
])
  test(`mobile ${width}×${height}: RTL, targets, dialogs, keyboard, scrolling`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const name of ["الرئيسية", "التغذية", "النشاط", "التقدم"]) {
      await nav(page, name);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const small = await page
        .locator("button:visible,summary:visible,.checks label:visible")
        .evaluateAll((items) =>
          items
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return r.width < 44 || r.height < 44;
            })
            .map((e) => e.textContent),
        );
      expect(small).toEqual([]);
      await page.screenshot({
        path: info.outputPath(`${name}.png`),
        fullPage: true,
      });
    }
    await page.getByRole("button", { name: "إضافة سريعة" }).click();
    await expect(
      page.getByRole("button", { name: "إغلاق", exact: true }),
    ).toBeFocused();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await expect(page.locator("main")).toHaveAttribute("inert", "");
    await page.keyboard.press("Shift+Tab");
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "سجّل الوزن" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "إغلاق", exact: true }),
    ).toBeFocused();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "سجّل وجبة" })
      .click();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "إضافة سريعة" }),
    ).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await page.getByRole("button", { name: "الملف الشخصي" }).click();
    await page.getByRole("combobox", { name: /^المستوى/ }).selectOption("متقدم");
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "الملف الشخصي" }),
    ).toBeFocused();
    await settings(page);
    await page.locator("#clock").fill("21:00");
    await page.getByRole("button", { name: "جرب تمرين منزلي" }).click();
    await page.getByRole("button", { name: "15 دقائق", exact: true }).click();
    expect(
      await page
        .locator(".sheet")
        .evaluate((e) => e.scrollHeight > e.clientHeight),
    ).toBe(true);
    await page
      .getByRole("button", { name: "ابدأ الجلسة" })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("button", { name: "ابدأ الجلسة" }),
    ).toBeInViewport();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "جرب تمرين منزلي" }),
    ).toBeFocused();
    expect(errors).toEqual([]);
  });
