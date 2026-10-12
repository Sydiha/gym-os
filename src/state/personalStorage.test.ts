import { describe, expect, it } from "vitest";
import { emptyPersonal } from "../domain/fixtures";
import type { DemoData } from "../domain/types";
import { makeBackup, parseBackup, createPersonalRepository, type PersonalAdapter } from "./personalStorage";
import { saveDemo, STORE } from "./persistence";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function adapter(initial = emptyPersonal()) {
  let durable = structuredClone(initial);
  const storage: PersonalAdapter = {
    load: async () => structuredClone(durable),
    save: async (next) => { durable = structuredClone(next); },
  };
  return { storage, read: () => structuredClone(durable), write: (next: DemoData) => { durable = structuredClone(next); } };
}

describe("Personal Mode data and backup format", () => {
  it("upgrades legacy personal snapshots without changing existing records", async () => {
    const source = emptyPersonal();
    source.meals.push({ id: "m", name: "meal", calories: 10, protein: 1, carbs: 1, fat: 1, source: "user", date: "2026-10-10" });
    const legacy = structuredClone(source);
    delete legacy.training;
    const state = adapter(legacy);
    const repo = createPersonalRepository(state.storage);
    const loaded = await repo.load();
    expect(loaded.meals).toEqual(legacy.meals);
    expect(loaded.training).toEqual({ preferences: null, plans: [], sessions: [] });
    expect(state.read()).toEqual(legacy);
    expect(await repo.load()).toEqual(loaded);
    const exported = await repo.exportBackup();
    expect(exported.schemaVersion).toBe(2);
    expect(parseBackup({ schemaVersion: 1, exportedAt: exported.exportedAt, data: legacy }).data).toEqual(loaded);
  });
  it("rejects malformed training in backups without modifying the source", () => {
    const source = emptyPersonal();
    const backup = makeBackup(source);
    expect(() => parseBackup({ ...backup, data: { ...source, training: { preferences: null, plans: [], sessions: [{ id: "bad" }] } } })).toThrow();
    expect(source.training?.sessions).toEqual([]);
    expect(() => parseBackup({ ...backup, data: { ...source, training: undefined } })).toThrow();
  });

  it("starts with no personal records", () => {
    const data = emptyPersonal();
    expect(data.meals).toEqual([]);
    expect(data.activities).toEqual([]);
    expect(data.homeSessions).toEqual([]);
    expect(data.weights).toEqual([]);
    expect(data.favorites).toEqual([]);
    expect(data.water).toBe(0);
    expect(data.goal).toBe(0);
  });
  it("round trips a complete versioned backup", () => {
    const source = emptyPersonal();
    source.weights.push({ id: "w-stable", kg: 72.5, date: "2026-10-11" });
    const backup = makeBackup(source);
    expect(parseBackup(JSON.parse(JSON.stringify(backup))).data).toEqual(source);
    expect(Number.isFinite(Date.parse(backup.exportedAt))).toBe(true);
  });
  it("accepts legacy activity records without start time and keeps new times optional", () => {
    const source = emptyPersonal();
    source.activities.push({ id: "legacy-activity", type: "مشي", minutes: 20, distance: 0, date: "2026-10-10" });
    const legacy = makeBackup(source);
    expect(parseBackup(JSON.parse(JSON.stringify(legacy))).data.activities[0]).toEqual(source.activities[0]);
    source.activities[0].startTime = "08:30";
    expect(parseBackup(JSON.parse(JSON.stringify(makeBackup(source)))).data.activities[0].startTime).toBe("08:30");
  });
  it("keeps valid zero nutrition values and rejects negative or non-finite values", () => {
    const source = emptyPersonal();
    source.meals.push({ id: "zero-meal", name: "صفر", calories: 0, protein: 0, carbs: 0, fat: 0, source: "تقدير", date: "2026-10-11" });
    expect(parseBackup(makeBackup(source)).data.meals[0].calories).toBe(0);
    expect(() => parseBackup(makeBackup({ ...source, meals: [{ ...source.meals[0], calories: -1 }] }))).toThrow();
    expect(() => parseBackup(makeBackup({ ...source, meals: [{ ...source.meals[0], calories: Number.NaN }] }))).toThrow();
    expect(() => parseBackup(makeBackup({ ...source, meals: [{ ...source.meals[0], calories: Number.POSITIVE_INFINITY }] }))).toThrow();
  });
  it("rejects unsupported versions and malformed records", () => {
    const backup = makeBackup(emptyPersonal());
    expect(() => parseBackup({ ...backup, schemaVersion: 3 })).toThrow();
    expect(() => parseBackup({ ...backup, data: { ...backup.data, meals: null } })).toThrow();
    expect(() => parseBackup(null)).toThrow();
  });

  it("serializes writes in order and exports only the committed snapshot", async () => {
    const gate = deferred<void>();
    const events: string[] = [];
    const state = adapter();
    let first = true;
    const storage: PersonalAdapter = {
      load: state.storage.load,
      save: async (next) => {
        events.push("start");
        if (first) { first = false; await gate.promise; }
        state.write(next); events.push("commit");
      },
    };
    const repo = createPersonalRepository(storage);
    await repo.load();
    const meal = { id: "m1", name: "وجبة", calories: 300, protein: 20, carbs: 30, fat: 10, source: "إدخال المستخدم", date: "2026-10-11" };
    const save = repo.commit((draft) => { draft.meals.push(meal); });
    const backupPromise = repo.exportBackup();
    let exported = false;
    void backupPromise.then(() => { exported = true; });
    await Promise.resolve();
    expect(exported).toBe(false);
    gate.resolve();
    await save;
    const backup = await backupPromise;
    expect(backup.data.meals).toEqual([meal]);
    expect(events).toEqual(["start", "commit"]);
  });
  it("serializes overlapping changes against the latest committed snapshot", async () => {
    const state = adapter();
    const repo = createPersonalRepository(state.storage);
    await repo.load();
    const legacy = { id: "legacy", type: "مشي", minutes: 20, distance: 0, date: "2026-10-10" };
    await Promise.all([
      repo.commit((draft) => { draft.activities.push(legacy); }),
      repo.commit((draft) => { draft.settings.level = "متقدم"; }),
      repo.commit((draft) => { draft.settings.knee = true; }),
    ]);
    expect(state.read().activities[0]).toEqual(legacy);
    expect(state.read().settings).toMatchObject({ level: "متقدم", knee: true });
  });

  it("keeps failed intermediate snapshots out of storage and backup until recovery", async () => {
    const state = adapter();
    let writes = 0;
    const repo = createPersonalRepository({
      load: state.storage.load,
      save: async (next) => {
        writes++;
        if (writes === 2) throw new Error("quota");
        state.write(next);
      },
    });
    const initial = await repo.load();
    const firstWrite = repo.commit((draft) => { draft.water = 1; });
    const failedWrite = repo.commit((draft) => { draft.goal = 2000; });
    const queuedWrite = repo.commit((draft) => { draft.settings.knee = true; });

    await firstWrite;
    await expect(failedWrite).rejects.toThrow("quota");
    await expect(queuedWrite).rejects.toThrow("recovery");
    expect(state.read()).toEqual({ ...initial, water: 1 });
    await expect(repo.exportBackup()).rejects.toThrow("recovery");

    expect(await repo.load()).toEqual({ ...initial, water: 1 });
    await repo.commit((draft) => { draft.settings.knee = true; });
    expect(state.read()).toMatchObject({ water: 1, goal: 0, settings: { knee: true } });
    expect((await repo.exportBackup()).data).toEqual(state.read());
  });

  it("keeps recovery locked after a failed write and recovers from a committed read", async () => {
    const state = adapter();
    let fail = true;
    const repo = createPersonalRepository({
      load: state.storage.load,
      save: async (next) => { if (fail) throw new Error("quota"); state.write(next); },
    });
    const initial = await repo.load();
    await expect(repo.commit((d) => { d.water += 1; })).rejects.toThrow();
    expect(state.read()).toEqual(initial);
    expect(repo.isBlocked()).toBe(true);
    await expect(repo.commit((d) => { d.water += 1; })).rejects.toThrow();
    await expect(repo.exportBackup()).rejects.toThrow();
    fail = false;
    expect(await repo.load()).toEqual(initial);
    expect(repo.isBlocked()).toBe(false);
  });

  it("places a confirmed restore after pending writes so an older save cannot replace it", async () => {
    const gate = deferred<void>();
    const state = adapter();
    let first = true;
    const repo = createPersonalRepository({
      load: state.storage.load,
      save: async (next) => { if (first) { first = false; await gate.promise; } state.write(next); },
    });
    await repo.load();
    const save = repo.commit((d) => { d.water = 7; });
    const replacement = emptyPersonal(); replacement.water = 2;
    const restore = repo.restore(replacement);
    gate.resolve();
    await Promise.all([save, restore]);
    expect(state.read()).toEqual(replacement);
    expect((await repo.exportBackup()).data).toEqual(replacement);
  });

  it("leaves the prior snapshot untouched when a restore write fails", async () => {
    const state = adapter();
    const repo = createPersonalRepository({
      load: state.storage.load,
      save: async () => { throw new Error("quota"); },
    });
    const previous = await repo.load();
    const replacement = emptyPersonal(); replacement.water = 9;
    await expect(repo.restore(replacement)).rejects.toThrow();
    expect(state.read()).toEqual(previous);
    expect(repo.isBlocked()).toBe(true);
  });

  it("keeps the Demo localStorage key isolated from Personal repository writes", async () => {
    localStorage.clear();
    const demo = emptyPersonal(); demo.goal = 2100; demo.water = 3;
    expect(saveDemo(demo)).toBe(true);
    const savedDemo = localStorage.getItem(STORE);
    const state = adapter();
    const gate = deferred<void>();
    const repo = createPersonalRepository({
      load: state.storage.load,
      save: async (next) => { await gate.promise; state.write(next); },
    });
    await repo.load();
    const personalWrite = repo.commit((d) => { d.water = 4; });
    const demoReload = repo.load();
    gate.resolve();
    await personalWrite;
    expect((await demoReload).water).toBe(4);
    expect(localStorage.getItem(STORE)).toBe(savedDemo);
    expect(state.read().water).toBe(4);
    expect(JSON.parse(localStorage.getItem(STORE)!).water).toBe(3);
  });
});
