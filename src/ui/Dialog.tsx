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
  const overlay = useRef<HTMLDivElement>(null),
    root = useRef<HTMLElement>(null),
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
    const viewport = window.visualViewport;
    if (!viewport) return;
    const layer = overlay.current;
    if (!layer) return;
    let frame = 0;
    function sync() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!viewport) return;
        const active = document.activeElement;
        const editing = active instanceof HTMLElement &&
          root.current?.contains(active) &&
          active.matches("input, textarea, select, [contenteditable=true]");
        if (!editing) {
          layer!.style.removeProperty("left");
          layer!.style.removeProperty("top");
          layer!.style.removeProperty("right");
          layer!.style.removeProperty("bottom");
          layer!.style.removeProperty("width");
          layer!.style.removeProperty("height");
          layer!.style.removeProperty("min-height");
          return;
        }
        // iOS standalone PWAs can pan or zoom the visual viewport when typing.
        // Keep the dialog inside the actually visible area, without disabling zoom.
        layer!.style.left = `${viewport.offsetLeft}px`;
        layer!.style.top = `${viewport.offsetTop}px`;
        layer!.style.right = "auto";
        layer!.style.bottom = "auto";
        layer!.style.width = `${viewport.width}px`;
        layer!.style.height = `${viewport.height}px`;
        layer!.style.minHeight = `${viewport.height}px`;
      });
    }
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", sync);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      document.removeEventListener("focusin", sync);
      document.removeEventListener("focusout", sync);
    };
  }, []);
  useLayoutEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
    root.current?.scrollTo?.(0, 0);
  }, [stage]);
  return (
    <div
      ref={overlay}
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
