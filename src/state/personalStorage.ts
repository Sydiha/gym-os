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
    return value;
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

export interface PersonalBackup { schemaVersion: 1; exportedAt: string; data: DemoData }
export function makeBackup(data: DemoData): PersonalBackup {
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), data: structuredClone(data) };
}
export function parseBackup(value: unknown): PersonalBackup {
  if (!value || typeof value !== "object") throw new Error("الملف ليس نسخة احتياطية صالحة.");
  const b = value as Partial<PersonalBackup>;
  if (b.schemaVersion !== 1) throw new Error("إصدار النسخة الاحتياطية غير مدعوم.");
  if (typeof b.exportedAt !== "string" || !Number.isFinite(Date.parse(b.exportedAt)) || !isPersonalData(b.data))
    throw new Error("تعذر التحقق من بيانات الملف؛ لم تُستبدل بياناتك.");
  return b as PersonalBackup;
}
