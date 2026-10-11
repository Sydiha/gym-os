import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { emptyPersonal } from "../domain/fixtures";
import { createPersonalRepository, type PersonalAdapter } from "./personalStorage";
import { DemoProvider, useDemo } from "./DemoContext";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => { resolve = yes; });
  return { promise, resolve };
}

function Probe() {
  const { data, mode, busy, update, setMode, exportPersonalBackup } = useDemo();
  return <>
    <output data-testid="state">{mode}:{data.water}:{busy ? "busy" : "idle"}</output>
    <button onClick={() => update((draft) => { draft.water += 1; })}>increment</button>
    <button onClick={() => setMode("demo")}>demo</button>
    <button onClick={() => void exportPersonalBackup().then((backup) => {
      document.querySelector("output[data-testid=backup]")!.textContent = String(backup.data.water);
    })}>export</button>
    <output data-testid="backup" />
  </>;
}

describe("DemoContext write lifecycle", () => {
  it("keeps mode switching blocked while a write is pending and exports its committed value", async () => {
    localStorage.removeItem("gym-os-mode");
    const gate = deferred<void>();
    let durable = emptyPersonal();
    const adapter: PersonalAdapter = {
      load: async () => structuredClone(durable),
      save: async (next) => { await gate.promise; durable = structuredClone(next); },
    };
    const repository = createPersonalRepository(adapter);
    render(<DemoProvider repository={repository}><Probe /></DemoProvider>);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("personal:0:idle"));

    fireEvent.click(screen.getByText("increment"));
    expect(screen.getByTestId("state")).toHaveTextContent("personal:1:busy");
    fireEvent.click(screen.getByText("demo"));
    expect(screen.getByTestId("state")).toHaveTextContent("personal:1:busy");
    fireEvent.click(screen.getByText("export"));
    await act(async () => { gate.resolve(); });

    await waitFor(() => expect(screen.getByTestId("backup")).toHaveTextContent("1"));
    expect(durable.water).toBe(1);
  });
});
