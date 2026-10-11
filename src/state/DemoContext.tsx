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
import { createPersonalRepository, type PersonalBackup } from "./personalStorage";
import { emptyPersonal } from "../domain/fixtures";
type Mode = "personal" | "demo";
const MODE_KEY = "gym-os-mode";
const personalRepository = createPersonalRepository();
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
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const modeRef = useRef(mode);
  const generation = useRef(0);
  const operation = useRef(0);
  const [page, setPage] = useState<Page>("الرئيسية");
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let live = true;
    const version = generation.current;
    setReady(mode === "demo");
    if (mode === "demo") {
      const next = loadDemo(); current.current = next; setData(next); setReady(true);
    } else {
      personalRepository.load().then((next) => {
        if (live && generation.current === version && modeRef.current === "personal") {
          current.current = next; setData(next); setReadBlocked(false); setReady(true);
        }
      }).catch(() => {
        if (live && generation.current === version && modeRef.current === "personal") {
          setReadBlocked(true); setNotice("تعذر قراءة بياناتك الشخصية. لن تُجرَ تعديلات حتى يمكن استرجاعها بأمان."); setReady(true);
        }
      });
    }
    return () => { live = false; };
  }, [mode]);
  function persistDemo(next: DemoData, message: string) {
    setNotice(saveDemo(next) ? message : "تعذر حفظ بيانات Demo في هذا المتصفح.");
  }
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [demoOpen, setDemoOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  function update(change: (draft: DemoData) => void, message = "") {
    if (!ready) { setNotice("انتظر حتى تكتمل قراءة البيانات قبل تعديلها."); return; }
    if (mode === "personal" && readBlocked) { setNotice("تعذر تعديل البيانات قبل نجاح قراءتها من مساحة التخزين."); return; }
    if (busyRef.current) { setNotice("جارٍ حفظ التغيير السابق. انتظر حتى يكتمل."); return; }
    if (mode === "demo") {
      const next = structuredClone(current.current); change(next); current.current = next; setData(next); persistDemo(next, message); return;
    }
    const version = generation.current;
    const token = ++operation.current;
    busyRef.current = true; setBusy(true); setNotice("جارٍ حفظ بياناتك…");
    personalRepository.commit(change).then((next) => {
      if (generation.current === version && modeRef.current === "personal" && operation.current === token) {
        current.current = next; setData(next); setReadBlocked(false); setNotice(message);
      }
    }).catch(() => {
      if (generation.current === version && modeRef.current === "personal" && operation.current === token) {
        setReadBlocked(personalRepository.isBlocked());
        setNotice("تعذر حفظ بياناتك. بقيت آخر نسخة محفوظة، وأوقفنا التعديلات حتى تعيد التحميل أو تستعيد نسخة احتياطية.");
      }
    }).finally(() => {
      if (generation.current === version && operation.current === token) { busyRef.current = false; setBusy(false); }
    });
  }
  function replace(next: DemoData, message: string) {
    if (!ready) { setNotice("انتظر حتى تكتمل قراءة البيانات قبل تعديلها."); return; }
    if (mode === "personal" && readBlocked) { setNotice("تعذر تعديل البيانات قبل نجاح قراءتها من مساحة التخزين."); return; }
    if (mode === "demo") { current.current = next; setData(next); persistDemo(next, message); return; }
    update((draft) => { Object.assign(draft, structuredClone(next)); }, message);
  }
  function setMode(nextMode: Mode) {
    try { localStorage.setItem(MODE_KEY, nextMode); } catch { /* Mode is session state too. */ }
    generation.current += 1; modeRef.current = nextMode; busyRef.current = false; setBusy(false);
    const nextData = nextMode === "demo" ? loadDemo() : emptyPersonal();
    current.current = nextData; setData(nextData);
    setReady(false); setReadBlocked(false); setNotice(""); setModeState(nextMode);
  }
  async function restorePersonal(next: DemoData) {
    if (modeRef.current !== "personal" || !ready) { setNotice("انتظر حتى تكون في الوضع الشخصي وتكتمل قراءة البيانات قبل الاستعادة."); return false; }
    const version = generation.current;
    const token = ++operation.current;
    busyRef.current = true; setBusy(true); setNotice("جارٍ حفظ النسخة الاحتياطية…");
    try {
      const committed = await personalRepository.restore(next);
      if (generation.current === version && modeRef.current === "personal" && operation.current === token) {
        current.current = committed; setData(committed); setReadBlocked(false); setNotice("استُعيدت النسخة الاحتياطية بنجاح.");
      }
      return true;
    } catch {
      if (generation.current === version && modeRef.current === "personal" && operation.current === token) {
        try {
          const latest = await personalRepository.load();
          if (generation.current === version && modeRef.current === "personal" && operation.current === token) {
            current.current = latest; setData(latest); setReadBlocked(false);
            setNotice("تعذرت الاستعادة؛ بقيت آخر نسخة محفوظة كما هي.");
          }
        } catch {
          if (generation.current === version && modeRef.current === "personal" && operation.current === token) {
            setReadBlocked(true); setNotice("تعذرت الاستعادة وقراءة البيانات الحالية. أعد تحميلها أو استعد نسخة احتياطية.");
          }
        }
      }
      return false;
    } finally {
      if (generation.current === version && operation.current === token) { busyRef.current = false; setBusy(false); }
    }
  }
  async function exportPersonalBackup(): Promise<PersonalBackup> {
    if (modeRef.current !== "personal") throw new Error("التصدير متاح في الوضع الشخصي فقط.");
    try { return await personalRepository.exportBackup(); }
    catch {
      if (modeRef.current === "personal" && personalRepository.isBlocked()) {
        setReadBlocked(true); setNotice("تعذر تصدير النسخة لأن آخر تغيير لم يُحفظ. استعد نسخة احتياطية أو أعد تحميل البيانات أولًا.");
      }
      throw new Error("تعذر تصدير النسخة الاحتياطية.");
    }
  }
  function report(message: string) { setNotice(message); }
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
    mode, setMode, ready, readBlocked, busy, restorePersonal, exportPersonalBackup, report,
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
