import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
const selector =
  'button:not([disabled]),input:not([disabled]),select:not([disabled]),a[href],[tabindex="0"]';
export function Dialog({
  children,
  close,
  opener,
  stage,
}: {
  children: ReactNode;
  close: () => void;
  opener: RefObject<HTMLElement | null>;
  stage: string;
}) {
  const root = useRef<HTMLElement>(null),
    closeButton = useRef<HTMLButtonElement>(null),
    onClose = useRef(close);
  onClose.current = close;
  useLayoutEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    function keyboard(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose.current();
      } else if (e.key === "Tab") {
        const items = [
          ...root.current!.querySelectorAll<HTMLElement>(selector),
        ];
        const first = items[0],
          last = items.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            !root.current!.contains(document.activeElement))
        ) {
          e.preventDefault();
          last?.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            !root.current!.contains(document.activeElement))
        ) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    function focus(e: FocusEvent) {
      if (e.target instanceof Node && !root.current?.contains(e.target))
        closeButton.current?.focus({ preventScroll: true });
    }
    document.addEventListener("keydown", keyboard);
    document.addEventListener("focusin", focus);
    return () => {
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("focusin", focus);
      document.body.style.overflow = previous;
      document.body.classList.remove("modal-open");
      const target = opener.current;
      queueMicrotask(() => {
        if (target?.isConnected) target.focus({ preventScroll: true });
        else document.getElementById("main")?.focus({ preventScroll: true });
      });
    };
  }, [opener]);
  useLayoutEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
    root.current?.scrollTo?.(0, 0);
  }, [stage]);
  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        ref={root}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={stage === "exercise" ? "الحركة الحالية" : "تفاصيل النموذج"}
      >
        <div className="sheet-head">
          <span className="accent">GYM OS</span>
          <button
            ref={closeButton}
            className="close"
            onClick={close}
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
