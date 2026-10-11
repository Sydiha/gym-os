import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { DemoData, Page, Sheet } from "../domain/types";
import { loadDemo, saveDemo } from "./persistence";
import { loadPersonal, savePersonal } from "./personalStorage";
import { emptyPersonal } from "../domain/fixtures";
type Mode = "personal" | "demo";
const MODE_KEY = "gym-os-mode";
function initialMode(): Mode {
  try { return localStorage.getItem(MODE_KEY) === "demo" ? "demo" : "personal"; }
  catch { return "personal"; }
}
function useDemoState() {
  const [mode, setModeState] = useState<Mode>(initialMode);
  const [data, setData] = useState(() => mode === "demo" ? loadDemo() : emptyPersonal());
  const current = useRef(data);
  const [ready, setReady] = useState(mode === "demo");
  const [readBlocked, setReadBlocked] = useState(false);
  const writes = useRef(Promise.resolve());
  const [page, setPage] = useState<Page>("الرئيسية");
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let live = true;
    setReady(mode === "demo");
    if (mode === "demo") {
      const next = loadDemo(); current.current = next; setData(next); setReady(true);
    } else {
      loadPersonal().then((next) => { if (live) { current.current = next; setData(next); setReadBlocked(false); setReady(true); } })
        .catch(() => { if (live) { setReadBlocked(true); setNotice("تعذر قراءة بياناتك الشخصية. لن تُجرَ تعديلات حتى يمكن استرجاعها بأمان."); setReady(true); } });
    }
    return () => { live = false; };
  }, [mode]);
  function persist(next: DemoData, message: string) {
    if (mode === "demo") setNotice(saveDemo(next) ? message : "تعذر حفظ بيانات Demo في هذا المتصفح.");
    else {
      writes.current = writes.current.catch(() => undefined).then(() => savePersonal(next));
      writes.current.then(() => setNotice(message)).catch(() => setNotice("تعذر حفظ بياناتك الشخصية. تحقّق من مساحة التخزين وصدّر نسخة احتياطية عند الإمكان."));
    }
  }
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [demoOpen, setDemoOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  function update(change: (draft: DemoData) => void, message = "") {
    if (!ready) { setNotice("انتظر حتى تكتمل قراءة البيانات قبل تعديلها."); return; }
    if (mode === "personal" && readBlocked) { setNotice("تعذر تعديل البيانات قبل نجاح قراءتها من مساحة التخزين."); return; }
    const next = structuredClone(current.current);
    change(next);
    current.current = next;
    setData(next);
    persist(next, message);
  }
  function replace(next: DemoData, message: string) {
    if (!ready) { setNotice("انتظر حتى تكتمل قراءة البيانات قبل تعديلها."); return; }
    if (mode === "personal" && readBlocked) { setNotice("تعذر تعديل البيانات قبل نجاح قراءتها من مساحة التخزين."); return; }
    current.current = next;
    setData(next);
    persist(next, message);
  }
  function setMode(nextMode: Mode) {
    try { localStorage.setItem(MODE_KEY, nextMode); } catch { /* Mode is session state too. */ }
    const nextData = nextMode === "demo" ? loadDemo() : emptyPersonal();
    current.current = nextData; setData(nextData);
    setReady(false); setReadBlocked(false); setNotice(""); setModeState(nextMode);
  }
  async function restorePersonal(next: DemoData) {
    if (!ready) { setNotice("انتظر حتى تكتمل قراءة البيانات قبل الاستعادة."); return false; }
    try { await savePersonal(next); if (mode === "personal") { current.current = next; setData(next); setReadBlocked(false); }
      setNotice("استُعيدت النسخة الاحتياطية بنجاح."); return true;
    } catch { setNotice("تعذر استعادة النسخة؛ بقيت بياناتك الحالية كما هي."); return false; }
  }
  function open(next: Sheet) {
    if (!sheet)
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    setNotice("");
    setSheet(next);
  }
  function navigate(next: Page) {
    setPage(next);
    setSheet(null);
    setNotice("");
    window.scrollTo(0, 0);
  }
  function water() {
    update((d) => {
      d.water++;
    }, "أُضيف كوب ماء.");
    setSheet(null);
  }
  return {
    data,
    mode, setMode, ready, readBlocked, restorePersonal,
    update,
    replace,
    page,
    navigate,
    sheet,
    setSheet,
    open,
    notice,
    time,
    setTime,
    demoOpen,
    setDemoOpen,
    opener,
    water,
  };
}
const Context = createContext<ReturnType<typeof useDemoState> | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const state = useDemoState();
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing DemoProvider");
  return value;
}
