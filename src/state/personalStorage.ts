import { upgradePersonalData } from "./trainingMigration";
import type { DemoData } from "../domain/types";
import { emptyPersonal } from "../domain/fixtures";
import { isDemoData } from "./persistence";

export const PERSONAL_DB = "gym-os-personal";
export const PERSONAL_VERSION = 1;
const STORE = "snapshot";
export function isPersonalData(value: unknown): value is DemoData {
  if (!isDemoData(value)) return false;
  const data = value;
  const unique = (items: { id: string }[]) => new Set(items.map((x) => x.id)).size === items.length;
  return unique(data.meals) && unique(data.favorites) && unique(data.activities) && unique(data.weights) && unique(data.homeSessions);
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
  });
}
function database(): Promise<IDBDatabase> {
  if (!globalThis.indexedDB) return Promise.reject(new Error("IndexedDB unavailable"));
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PERSONAL_DB, PERSONAL_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Could not open database"));
    req.onblocked = () => reject(new Error("Database upgrade blocked"));
  });
}
export async function loadPersonal(): Promise<DemoData> {
  const db = await database();
  try {
    const value = await request(db.transaction(STORE, "readonly").objectStore(STORE).get("data"));
    if (value === undefined) return emptyPersonal();
    if (!isPersonalData(value)) throw new Error("Stored personal data is malformed");
    return upgradePersonalData(value);
  } finally { db.close(); }
}
export async function savePersonal(value: DemoData): Promise<void> {
  if (!isPersonalData(value)) throw new Error("Invalid personal data");
  const db = await database();
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(structuredClone(value), "data");
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Write failed"));
      tx.onabort = () => reject(tx.error ?? new Error("Write aborted"));
    });
  } finally { db.close(); }
}

export interface PersonalBackup { schemaVersion: 1 | 2; exportedAt: string; data: DemoData }
export function makeBackup(data: DemoData): PersonalBackup {
  return { schemaVersion: 2, exportedAt: new Date().toISOString(), data: upgradePersonalData(data) };
}
export function parseBackup(value: unknown): PersonalBackup {
  if (!value || typeof value !== "object") throw new Error("الملف ليس نسخة احتياطية صالحة.");
  const b = value as Partial<PersonalBackup>;
  if (b.schemaVersion !== 1 && b.schemaVersion !== 2) throw new Error("إصدار النسخة الاحتياطية غير مدعوم.");
  if (typeof b.exportedAt !== "string" || !Number.isFinite(Date.parse(b.exportedAt)) || !isPersonalData(b.data))
    throw new Error("تعذر التحقق من بيانات الملف؛ لم تُستبدل بياناتك.");
  if (b.schemaVersion === 2 && !b.data.training) throw new Error("Missing training data");
  return { schemaVersion: 2, exportedAt: b.exportedAt, data: upgradePersonalData(b.data) };
}

export interface PersonalAdapter {
  load(): Promise<DemoData>;
  save(value: DemoData): Promise<void>;
}

/** Serializes every personal snapshot operation and only exposes committed data. */
export function createPersonalRepository(adapter: PersonalAdapter = { load: loadPersonal, save: savePersonal }) {
  let tail: Promise<void> = Promise.resolve();
  let committed: DemoData | null = null;
  let blocked = false;
  function enqueue<T>(job: () => Promise<T>): Promise<T> {
    const result = tail.then(job);
    tail = result.then(() => undefined, () => undefined);
    return result;
  }
  async function readCommitted() {
    const value = await adapter.load();
    if (!isPersonalData(value)) throw new Error("Stored personal data is malformed");
    committed = upgradePersonalData(value);
    blocked = false;
    return structuredClone(committed);
  }
  return {
    load: () => enqueue(async () => {
      try { return await readCommitted(); }
      catch (error) { blocked = true; throw error; }
    }),
    commit: (change: (draft: DemoData) => void) => enqueue(async () => {
      if (blocked) throw new Error("Personal storage requires recovery");
      let base: DemoData;
      try { base = committed ?? await readCommitted(); }
      catch (error) { blocked = true; throw error; }
      const next = upgradePersonalData(base);
      change(next);
      if (!isPersonalData(next)) throw new Error("Invalid personal data");
      try { await adapter.save(next); }
      catch (error) { blocked = true; throw error; }
      committed = structuredClone(next);
      return structuredClone(next);
    }),
    restore: (next: DemoData) => enqueue(async () => {
      if (!isPersonalData(next)) throw new Error("Invalid backup data");
      next = upgradePersonalData(next);
      try {
        await adapter.save(next);
        committed = structuredClone(next);
        blocked = false;
        return structuredClone(next);
      } catch (error) { blocked = true; throw error; }
    }),
    exportBackup: () => enqueue(async () => {
      if (blocked) throw new Error("Personal storage requires recovery before export");
      if (committed === null) {
        try { await readCommitted(); }
        catch (error) { blocked = true; throw error; }
      }
      return makeBackup(committed!);
    }),
    isBlocked: () => blocked,
  };
}
