import { expect, test } from "@playwright/test";

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
  await page.reload();
  await expect(page.locator(".water")).toContainText("٤");
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
