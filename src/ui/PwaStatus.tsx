import { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useOnline } from "../useOnline";
export function PwaStatus() {
  const online = useOnline();
  const [cacheError, setCacheError] = useState(false);
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError() {
      setCacheError(true);
    },
  });
  return (
    <div className="pwa-status">
      <div role="status" aria-live="polite">
        <p>{online ? "أنت متصل بالإنترنت" : "أنت غير متصل بالإنترنت"}</p>
        <p>
          {cacheError
            ? "تعذر تجهيز النسخة للاستخدام دون اتصال. أعد المحاولة عند فتح التطبيق مجددًا."
            : offlineReady
              ? "يمكنك فتح هذه الصفحة دون اتصال."
              : "تتوفر الصفحة دون اتصال بعد اكتمال تحميلها لأول مرة."}
        </p>
      </div>
      {needRefresh && (
        <section className="pwa-update" aria-label="تحديث التطبيق">
          <p>يتوفر تحديث جديد.</p>
          <button
            className="wide"
            onClick={() => {
              void updateServiceWorker(true).catch(() => setCacheError(true));
            }}
          >
            تحديث الآن
          </button>
        </section>
      )}
    </div>
  );
}
