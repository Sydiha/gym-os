import { expect, test } from "@playwright/test";

test("water tracks current day, keeps counts on reload, and resets next day", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-13T09:00:00") });
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await expect(page.getByText("الماء ٠ أكواب")).toBeVisible();
  await page.getByRole("button", { name: "+ كوب" }).click();
  await expect(page.getByText("الماء ١ أكواب")).toBeVisible();
  await page.reload();
  await expect(page.getByText("الماء ١ أكواب")).toBeVisible();
  await page.clock.setFixedTime(new Date("2026-10-14T09:00:00"));
  await page.reload();
  await expect(page.getByText("الماء ٠ أكواب")).toBeVisible();
  await page.getByRole("button", { name: "+ كوب" }).click();
  await expect(page.getByText("الماء ١ أكواب")).toBeVisible();
  await page.reload();
  await expect(page.getByText("الماء ١ أكواب")).toBeVisible();
});

test("legacy undated water value is not misrepresented as today's intake", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("جارٍ تحميل بياناتك…")).toHaveCount(0);
  await page.evaluate(async () => {
    const request = indexedDB.open("gym-os-personal", 1);
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const tx = database.transaction("snapshot", "readwrite");
    const store = tx.objectStore("snapshot");
    const get = store.get("data");
    await new Promise<void>((resolve, reject) => {
      get.onsuccess = () => resolve();
      get.onerror = () => reject(get.error);
    });
    const data = get.result;
    data.water = 5;
    delete data.waterDate;
    store.put(data, "data");
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    database.close();
  });
  await page.reload();
  await expect(page.getByText("الماء ٠ أكواب")).toBeVisible();
  await page.getByRole("button", { name: "+ كوب" }).click();
  await expect(page.getByText("الماء ١ أكواب")).toBeVisible();
});
