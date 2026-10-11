import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { emptyPersonal } from "./domain/fixtures";
import { createPersonalRepository, type PersonalAdapter } from "./state/personalStorage";

const sw = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: false,
  update: vi.fn().mockResolvedValue(undefined),
  onError: undefined as (() => void) | undefined,
}));
vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: (options: { onRegisterError: () => void }) => {
    sw.onError = options.onRegisterError;
    return {
      offlineReady: [sw.offlineReady],
      needRefresh: [sw.needRefresh],
      updateServiceWorker: sw.update,
    };
  },
}));

beforeEach(() => {
  localStorage.clear();
  // Keep the V1.5 shell regression checks on their original demo fixtures.
  localStorage.setItem("gym-os-mode", "demo");
  sw.offlineReady = false;
  sw.needRefresh = false;
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value: true,
  });
});

describe("foundation shell", () => {
  it("renders the approved dashboard and navigation", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "اليوم يكفي أن تبدأ",
    );
    expect(screen.getByText("نموذج تجريبي")).toBeVisible();
    expect(screen.getByRole("navigation")).toBeVisible();
    expect(screen.getByRole("button", { name: "سجّل وجبة" })).toBeVisible();
  });
  it("announces offline and restored connectivity", () => {
    render(<App />);
    expect(screen.getByRole("status")).toHaveTextContent("أنت متصل بالإنترنت");
    act(() => {
      Object.defineProperty(navigator, "onLine", {
        configurable: true,
        value: false,
      });
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "أنت غير متصل بالإنترنت",
    );
    act(() => {
      Object.defineProperty(navigator, "onLine", {
        configurable: true,
        value: true,
      });
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.getByRole("status")).toHaveTextContent("أنت متصل بالإنترنت");
  });
  it("only announces offline readiness after precaching completes", () => {
    const view = render(<App />);
    expect(
      screen.queryByText("يمكنك فتح هذه الصفحة دون اتصال."),
    ).not.toBeInTheDocument();
    sw.offlineReady = true;
    view.rerender(<App />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "يمكنك فتح هذه الصفحة دون اتصال.",
    );
  });
  it("requires a user action to apply an available update", () => {
    sw.needRefresh = true;
    render(<App />);
    expect(sw.update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "تحديث الآن" }));
    expect(sw.update).toHaveBeenCalledWith(true);
  });
  it("reports registration failure without hiding the shell", () => {
    render(<App />);
    act(() => sw.onError?.());
    expect(screen.getByRole("status")).toHaveTextContent("تعذر تجهيز النسخة");
    expect(screen.getByRole("main")).toBeVisible();
  });
});

describe("personal mode async operations", () => {
  it("keeps a pending personal write out of Demo and reloads its durable snapshot on return", async () => {
    localStorage.setItem("gym-os-mode", "personal");
    let durable = emptyPersonal();
    let releaseSave!: () => void;
    let markSaveStarted!: () => void;
    const saveStarted = new Promise<void>((resolve) => { markSaveStarted = resolve; });
    const saveGate = new Promise<void>((resolve) => { releaseSave = resolve; });
    const adapter: PersonalAdapter = {
      load: async () => structuredClone(durable),
      save: async (snapshot) => {
        markSaveStarted();
        await saveGate;
        durable = structuredClone(snapshot);
      },
    };
    const personalRepository = createPersonalRepository(adapter);
    render(<App personalRepository={personalRepository} />);
    await screen.findByText("الماء ٠ أكواب");

    fireEvent.click(screen.getByRole("button", { name: "+ كوب" }));
    expect(screen.getByText("جارٍ حفظ بياناتك…")).toBeVisible();
    await act(async () => { await saveStarted; });

    fireEvent.click(screen.getByRole("button", { name: "الملف الشخصي" }));
    fireEvent.change(screen.getByLabelText("وضع الاستخدام"), { target: { value: "demo" } });
    expect(screen.getByLabelText("وضع الاستخدام")).toHaveValue("personal");
    fireEvent.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(screen.queryByText("نموذج تجريبي")).not.toBeInTheDocument();
    expect(screen.getByText("انتظر اكتمال حفظ البيانات قبل تبديل الوضع.")).toBeVisible();
    expect(screen.queryByText("أُضيف كوب ماء.")).not.toBeInTheDocument();

    await act(async () => { releaseSave(); await saveGate; });
    await waitFor(() => expect(durable.water).toBe(1));
    await waitFor(() => expect(screen.getByText("أُضيف كوب ماء.")).toBeVisible());

    fireEvent.click(screen.getByRole("button", { name: "الملف الشخصي" }));
    fireEvent.change(screen.getByLabelText("وضع الاستخدام"), { target: { value: "demo" } });
    fireEvent.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(screen.getByText("نموذج تجريبي")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "الملف الشخصي" }));
    fireEvent.change(screen.getByLabelText("وضع الاستخدام"), { target: { value: "personal" } });
    fireEvent.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(await screen.findByText("جارٍ تحميل بياناتك…")).toBeVisible();
    await waitFor(() => expect(screen.getByText("الماء ١ أكواب")).toBeVisible());
    expect(screen.getByText("وضع شخصي")).toBeVisible();
    expect(screen.queryByText("أُضيف كوب ماء.")).not.toBeInTheDocument();
  });
});
