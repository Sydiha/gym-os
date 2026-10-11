import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DemoData, Page, Sheet } from "../domain/types";
import { loadDemo, saveDemo } from "./persistence";
function useDemoState() {
  const [data, setData] = useState(loadDemo);
  const current = useRef(data);
  const [page, setPage] = useState<Page>("الرئيسية");
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [notice, setNotice] = useState("");
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [demoOpen, setDemoOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  function update(change: (draft: DemoData) => void, message = "") {
    const next = structuredClone(current.current);
    change(next);
    current.current = next;
    setData(next);
    setNotice(
      saveDemo(next) ? message : "تعذر حفظ بيانات Demo في هذا المتصفح.",
    );
  }
  function replace(next: DemoData, message: string) {
    current.current = next;
    setData(next);
    setNotice(
      saveDemo(next) ? message : "تعذر حفظ بيانات Demo في هذا المتصفح.",
    );
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
