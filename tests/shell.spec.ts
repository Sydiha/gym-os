import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("Personal and Demo modes stay isolated and Personal starts empty", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".demo-label")).toHaveText("وضع شخصي");
  await expect(page.locator(".water")).toContainText("٠");
  await expect(page.locator(".chart-foot")).toHaveText("من سجلاتك المسجلة");
  await page.getByRole("navigation").getByRole("button", { name: "التغذية", exact: true }).click();
  await expect(page.locator(".empty").first()).toContainText("لم تسجّل وجبة اليوم");
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  await page.getByLabel("وضع الاستخدام").selectOption("demo");
  await page.getByRole("button", { name: "إغلاق" }).click();
  await expect(page.locator(".demo-label")).toHaveText("نموذج تجريبي");
  await page.getByRole("navigation").getByRole("button", { name: "التغذية", exact: true }).click();
  await expect(page.locator(".record").first()).toContainText("وجبة تجريبية أولية");
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  await page.getByLabel("وضع الاستخدام").selectOption("personal");
  await page.getByRole("button", { name: "إغلاق" }).click();
  await expect(page.locator(".demo-label")).toHaveText("وضع شخصي");
  await page.getByRole("navigation").getByRole("button", { name: "التغذية", exact: true }).click();
  await expect(page.locator(".empty").first()).toContainText("لم تسجّل وجبة اليوم");
});

test("Personal profile settings persist after a reload", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  await page.getByLabel("المستوى").selectOption("متقدم");
  await page.locator("#profile-homeSuggestions").check();
  await page.locator("#profile-knee").check();
  await page.locator("#profile-shoulder").check();
  await page.getByRole("button", { name: "إغلاق" }).click();
  await page.reload();
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  await expect(page.getByLabel("المستوى")).toHaveValue("متقدم");
  await expect(page.locator("#profile-homeSuggestions")).toBeChecked();
  await expect(page.locator("#profile-knee")).toBeChecked();
  await expect(page.locator("#profile-shoulder")).toBeChecked();
});

test("legacy JSON backup imports and exports in an isolated browser profile", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  const backup = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    data: {
      goal: 0, water: 0, meals: [], favorites: [],
      activities: [{ id: "legacy", type: "مشي", minutes: 20, distance: 0, date: "2026-10-10" }],
      weights: [], homeSessions: [],
      settings: { homeSuggestions: false, knee: false, shoulder: false, level: "مبتدئ", expected: "18:00", dayType: "activity" },
      declinedDate: null,
    },
  };
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: "fixture-legacy-backup.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.locator(".toast")).toContainText("استُعيدت النسخة الاحتياطية بنجاح");
  await page.getByRole("button", { name: "إغلاق" }).click();
  await page.getByRole("navigation").getByRole("button", { name: "النشاط", exact: true }).click();
  await expect(page.locator(".record").filter({ hasText: "٢٠ دقيقة" })).toContainText("غير محدد");
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "تصدير نسخة احتياطية" }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(exported.schemaVersion).toBe(2);
  expect(exported.data.activities[0]).toEqual(backup.data.activities[0]);
  expect(exported.data.training).toEqual({ preferences: null, plans: [], sessions: [] });
});


test("real IndexedDB preserves legacy snapshot through upgrade and backup export", async ({ page }) => {
  await page.goto("/");
  const legacy = {
    goal: 2150, water: 4,
    meals: [{ id: "old-meal", name: "وجبة محفوظة", calories: 450, protein: 30, carbs: 40, fat: 12, source: "إدخال المستخدم", date: "2026-10-10" }],
    favorites: [], activities: [{ id: "old-walk", type: "مشي", minutes: 22, distance: null, date: "2026-10-10" }],
    weights: [{ id: "old-weight", kg: 99, date: "2026-10-10" }],
    homeSessions: [{ id: "old-home", date: "2026-10-10", minutes: 10, planned: 10, skipped: 0 }],
    settings: { homeSuggestions: true, knee: false, shoulder: true, level: "مبتدئ", expected: "18:00", dayType: "activity" },
    declinedDate: null,
  };
  await page.evaluate(async (data) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("gym-os-personal", 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains("snapshot")) request.result.createObjectStore("snapshot");
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("snapshot", "readwrite");
        tx.objectStore("snapshot").put(data, "data");
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
      };
    });
  }, legacy);
  await page.reload();
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await expect(page.locator(".demo-label")).toHaveText("وضع شخصي");
  const durable = await page.evaluate(async () => new Promise<unknown>((resolve, reject) => {
    const req = indexedDB.open("gym-os-personal", 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      const get = db.transaction("snapshot", "readonly").objectStore("snapshot").get("data");
      get.onsuccess = () => { db.close(); resolve(get.result); };
      get.onerror = () => { db.close(); reject(get.error); };
    };
  }));
  expect(durable).toEqual(legacy);
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "تصدير نسخة احتياطية" }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(exported.schemaVersion).toBe(2);
  for (const key of Object.keys(legacy)) expect(exported.data[key]).toEqual(legacy[key as keyof typeof legacy]);
  expect(exported.data.training).toEqual({ preferences: null, plans: [], sessions: [] });
});

for (const width of [320, 375, 390, 430, 1280]) {
  test(`Arabic RTL shell at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    const external: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (new URL(request.url()).origin !== "http://127.0.0.1:4173")
        external.push(request.url());
    });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "اليوم يكفي أن تبدأ",
    );
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      "rgb(21, 18, 25)",
    );
    await expect(page.locator("html")).toHaveCSS(
      "background-color",
      "rgb(21, 18, 25)",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "انتقل إلى المحتوى" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    if (width === 390 || width === 1280)
      await page.screenshot({
        path: testInfo.outputPath("shell.png"),
        fullPage: true,
      });
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}

test("manifest and local installation icons are valid", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const manifestUrl = await page
    .locator('link[rel="manifest"]')
    .getAttribute("href");
  const response = await request.get(manifestUrl!);
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest).toMatchObject({
    id: "/",
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: "#17131b",
    background_color: "#151219",
  });
  expect(manifest.icons).toHaveLength(3);
  for (const icon of manifest.icons) {
    const response = await request.get(icon.src);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
    const size = await page.evaluate(async (src: string) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      return `${img.naturalWidth}x${img.naturalHeight}`;
    }, icon.src);
    expect(size).toBe(icon.sizes);
  }
});

test("installed service worker serves the shell and assets while offline", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
    }
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".pwa-status [role=status]")).toContainText(
    "أنت غير متصل بالإنترنت",
  );
  await expect(page.locator("html")).toHaveCSS(
    "background-color",
    "rgb(21, 18, 25)",
  );
  await expect(page.locator(".icon svg").first()).toBeVisible();
  await page.getByRole("button", { name: "+ كوب", exact: true }).click();
  await expect(page.locator(".toast")).toContainText("أُضيف كوب ماء.");
  await expect(page.locator(".toast")).toHaveCSS("position", "static");
  await page.reload();
  await expect(page.locator(".water")).toContainText("١");
  for (const name of ["التغذية", "النشاط", "التقدم", "الرئيسية"]) {
    await page
      .getByRole("navigation")
      .getByRole("button", { name, exact: true })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  // A navigation not previously visited also falls back to the precached shell.
  await page.goto("/offline-check");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.setOffline(false);
  await expect(page.locator(".pwa-status [role=status]")).toContainText(
    "أنت متصل بالإنترنت",
  );
});

test("reduced motion preference and disabled JavaScript fallback", async ({
  page,
  browser,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  await page.getByLabel("وضع الاستخدام").selectOption("demo");
  await page.getByRole("button", { name: "إغلاق" }).click();
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  await expect(page.locator(".bar").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJs = await context.newPage();
  await noJs.goto("http://127.0.0.1:4173");
  await expect(noJs.locator("noscript")).toBeVisible();
  expect(await noJs.locator("noscript").textContent()).toContain(
    "يرجى تفعيل JavaScript",
  );
  await context.close();
});


test("Personal calorie goal accepts numeric input and persists across reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".demo-label")).toHaveText("وضع شخصي");
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  const goal = page.getByRole("spinbutton", { name: "هدف السعرات اليومي (اختياري)" });
  await expect(goal).toHaveAttribute("inputmode", "numeric");
  await goal.fill("2100");
  await goal.blur();
  await page.getByRole("button", { name: "إغلاق" }).click();
  await expect(page.locator(".cal-head")).toContainText("٢٬١٠٠");
  await page.reload();
  await expect(page.locator(".cal-head")).toContainText("٢٬١٠٠");
  await page.getByRole("button", { name: "الملف الشخصي" }).click();
  await expect(goal).toHaveValue("2100");
});
