import { describe, expect, it } from "vitest";
import { emptyPersonal } from "../domain/fixtures";
import { makeBackup, parseBackup } from "./personalStorage";

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
});
