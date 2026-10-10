import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useOnline } from './useOnline';

export function App() {
  const online = useOnline();
  const [cacheError, setCacheError] = useState(false);
  const { offlineReady: [offlineReady], needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisterError() { setCacheError(true); },
  });

  return (
    <div className="shell">
      <a className="skip-link" href="#main">انتقل إلى المحتوى</a>
      <header className="topline">
        <div>
          <div className="brand" dir="ltr">GYM <span>OS</span></div>
          <p className="tagline">صحتك... بأسلوب حياتك</p>
        </div>
        <span className="version" dir="ltr">V1.4</span>
      </header>
      <main id="main" tabIndex={-1}>
        <h1>اليوم يكفي أن <span className="underline">تبدأ</span></h1>
        <p className="lead">خطوتك الأولى نحو حياة أكثر نشاطًا.</p>
        <section className="welcome" aria-labelledby="welcome-title">
          <span className="icon"><img src="/icons/gym.svg" alt="" width="25" height="25" /></span>
          <h2 id="welcome-title">مرحبًا بك في GYM OS</h2>
          <p>هذه نسخة أولية. ستتوفر أدوات التغذية والنشاط والتقدم في إصدارات قادمة.</p>
        </section>
        <div className="connection" role="status" aria-live="polite">
          <p>{online ? 'أنت متصل بالإنترنت' : 'أنت غير متصل بالإنترنت'}</p>
          <p className="note">{cacheError
            ? 'تعذر تجهيز النسخة للاستخدام دون اتصال. أعد المحاولة عند فتح التطبيق مجددًا.'
            : offlineReady
              ? 'يمكنك فتح هذه الصفحة دون اتصال.'
              : 'تتوفر الصفحة دون اتصال بعد اكتمال تحميلها لأول مرة.'}</p>
        </div>
        {needRefresh && (
          <section className="update" aria-label="تحديث التطبيق">
            <p>يتوفر تحديث جديد.</p>
            <button className="primary" onClick={() => {
              void updateServiceWorker(true).catch(() => setCacheError(true));
            }}>تحديث الآن</button>
          </section>
        )}
      </main>
      <footer>نسخة أولية <span aria-hidden="true">·</span> <bdi>GYM OS</bdi></footer>
    </div>
  );
}
