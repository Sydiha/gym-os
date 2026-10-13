import { expect, test } from "@playwright/test";

const LEG_CURL_IMAGES = [
  "/exercises/reviewed/gym-leg-curl-main.webp",
  "/exercises/reviewed/gym-leg-curl-correct.webp",
  "/exercises/reviewed/gym-leg-curl-mistake-hips.webp",
  "/exercises/reviewed/gym-leg-curl-mistake-back-arch.webp",
];

test("exercise technique images remain available after a cached PWA goes offline", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);

  await expect.poll(async () => page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return false;
    const registration = await navigator.serviceWorker.getRegistration();
    return Boolean(registration?.active && navigator.serviceWorker.controller);
  }), { timeout: 30_000 }).toBe(true);

  // Ensure this build actually precached the full set; no network fallback can mask failures.
  await expect.poll(async () => page.evaluate(async (paths) => {
    const names = await caches.keys();
    const entries = await Promise.all(names.map(name => caches.open(name)));
    return Promise.all(paths.map(async path => {
      for (const cache of entries) {
        if (await cache.match(new URL(path, location.origin), { ignoreSearch: true })) return true;
      }
      return false;
    }));
  }, LEG_CURL_IMAGES), { timeout: 30_000 }).toEqual(LEG_CURL_IMAGES.map(() => true));

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("navigation").getByRole("button", { name: "التمارين" })).toBeVisible();
  await page.getByRole("navigation").getByRole("button", { name: "التمارين" }).click();
  const exercise = page.locator(".training-exercise").filter({ has: page.getByRole("heading", { name: "ثني الساق على الجهاز" }) });
  await exercise.getByRole("button", { name: "طريقة الأداء والأخطاء" }).click();
  for (const path of LEG_CURL_IMAGES) {
    const image = exercise.locator(`img[src="${path}"]`).first();
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty("complete", true);
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  }
});
