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
  it("rejects unsupported versions and malformed records", () => {
    const backup = makeBackup(emptyPersonal());
    expect(() => parseBackup({ ...backup, schemaVersion: 2 })).toThrow();
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
