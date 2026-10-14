import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { DemoData, Page, Sheet } from "../domain/types";
import type { Activity, Meal, Weight } from "../domain/types";
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
type PersonalRepository = ReturnType<typeof createPersonalRepository>;
type EditableRecord =
  | { kind: "meal"; record: Meal }
  | { kind: "activity"; record: Activity & { homeSession?: boolean } }
  | { kind: "weight"; record: Weight };
function useDemoState(repository: PersonalRepository) {
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
  const [editing, setEditing] = useState<EditableRecord | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let live = true;
    const version = generation.current;
    setReady(mode === "demo");
    if (mode === "demo") {
      const next = loadDemo(); current.current = next; setData(next); setReady(true);
    } else {
      repository.load().then((next) => {
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
  }, [mode, repository]);
  function persistDemo(next: DemoData, message: string) {
    setNotice(saveDemo(next) ? message : "تعذر حفظ بيانات Demo في هذا المتصفح.");
  }
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [demoOpen, setDemoOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  function update(change: (draft: DemoData) => void, message = "") {
    if (!ready) { setNotice("انتظر حتى تكتمل قراءة البيانات قبل تعديلها."); return; }
    if (mode === "personal" && readBlocked) { setNotice("تعذر تعديل البيانات قبل نجاح قراءتها من مساحة التخزين."); return; }
    if (mode === "demo") {
      const next = structuredClone(current.current); change(next); current.current = next; setData(next); persistDemo(next, message); return;
    }
    const optimistic = structuredClone(current.current);
    change(optimistic);
    current.current = optimistic;
    setData(optimistic);
    const version = generation.current;
    const token = ++operation.current;
    busyRef.current = true; setBusy(true); setNotice("جارٍ حفظ بياناتك…");
    repository.commit(change).then((next) => {
      if (generation.current === version && modeRef.current === "personal" && operation.current === token) {
        current.current = next; setData(next); setReadBlocked(false); setNotice(message);
      }
    }).catch(() => {
      if (generation.current === version && modeRef.current === "personal" && operation.current === token) {
        setReadBlocked(true);
        void repository.load().then((saved) => {
          if (generation.current === version && operation.current === token) {
            current.current = saved; setData(saved); setReadBlocked(false);
            setNotice("تعذر حفظ التغيير؛ أعدنا عرض آخر بيانات محفوظة.");
          }
        }).catch(() => {
          if (generation.current === version && operation.current === token) {
            setReadBlocked(true);
            setNotice("تعذر حفظ بياناتك أو قراءة النسخة المحفوظة. أعد تحميل التطبيق أو استعد نسخة احتياطية.");
          }
        });
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
    if (busyRef.current) {
      setNotice("انتظر اكتمال حفظ البيانات قبل تبديل الوضع.");
      return;
    }
    try { localStorage.setItem(MODE_KEY, nextMode); } catch { /* Mode is session state too. */ }
    generation.current += 1; modeRef.current = nextMode; busyRef.current = false; setBusy(false);
    const nextData = nextMode === "demo" ? loadDemo() : emptyPersonal();
    current.current = nextData; setData(nextData);
    setReady(false); setReadBlocked(false); setNotice(""); setModeState(nextMode);
  }
  async function restorePersonal(next: DemoData) {
    if (modeRef.current !== "personal" || !ready) { setNotice("انتظر حتى تكون في الوضع الشخصي وتكتمل قراءة البيانات قبل الاستعادة."); return false; }
    if (busyRef.current) { setNotice("هناك عملية حفظ جارية. انتظر اكتمالها قبل الاستعادة."); return false; }
    const version = generation.current;
    const token = ++operation.current;
    busyRef.current = true; setBusy(true); setNotice("جارٍ حفظ النسخة الاحتياطية…");
    try {
      const committed = await repository.restore(next);
      if (generation.current !== version || modeRef.current !== "personal" || operation.current !== token) return false;
      current.current = committed; setData(committed); setReadBlocked(false); setNotice("استُعيدت النسخة الاحتياطية بنجاح.");
      return true;
    } catch {
      if (generation.current === version && modeRef.current === "personal" && operation.current === token) {
        try {
          const latest = await repository.load();
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
    const version = generation.current;
    try {
      const backup = await repository.exportBackup();
      if (generation.current !== version || modeRef.current !== "personal") throw new Error("Export is no longer active");
      return backup;
    }
    catch {
      if (generation.current === version && modeRef.current === "personal" && repository.isBlocked()) {
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
    setEditing(null);
    setSheet(next);
  }
  function openEdit(next: EditableRecord) {
    if (!sheet)
      opener.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setNotice("");
    setEditing(next);
    setSheet(next.kind);
  }
  function closeSheet() {
    setSheet(null);
    setEditing(null);
  }
  function navigate(next: Page) {
    setPage(next);
    setSheet(null);
    setNotice("");
    window.scrollTo(0, 0);
  }
  function water() {
    update((d) => {
      const today = new Date();
      const localDay = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      d.water = d.waterDate === localDay ? d.water + 1 : 1;
      d.waterDate = localDay;
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
    closeSheet,
    editing,
    openEdit,
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
export function DemoProvider({ children, repository = personalRepository }: { children: ReactNode; repository?: PersonalRepository }) {
  const state = useDemoState(repository);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing DemoProvider");
  return value;
}
