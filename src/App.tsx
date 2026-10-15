import { DemoProvider, useDemo } from "./state/DemoContext";
import { createPersonalRepository } from "./state/personalStorage";
import { Dashboard } from "./features/Dashboard";
import { Nutrition } from "./features/Nutrition";
import { Activity } from "./features/Activity";
import { Progress } from "./features/Progress";
import { Training } from "./features/Training";
import { Dialogs } from "./features/Dialogs";
import { Icon, type IconName } from "./ui/Icon";
import { PwaStatus } from "./ui/PwaStatus";
import type { Page } from "./domain/types";
const pages: { page: Page; icon: IconName }[] = [
  { page: "الرئيسية", icon: "home" },
  { page: "التغذية", icon: "meal" },
  { page: "النشاط", icon: "walk" },
  { page: "التقدم", icon: "progress" },
  { page: "التمارين", icon: "walk" },
];
function Interface() {
  const { page, navigate, sheet, open, notice, mode, ready, readBlocked } = useDemo();
  const nav = (item: (typeof pages)[number]) => (
    <button
      key={item.page}
      onClick={() => navigate(item.page)}
      className={page === item.page ? "active" : ""}
      aria-label={item.page}
      aria-current={page === item.page ? "page" : undefined}
    >
      <Icon name={item.icon} />
      {item.page}
    </button>
  );
  return (
    <>
      <a className="skip-link" href="#main" inert={!!sheet}>
        انتقل إلى المحتوى
      </a>
      <main id="main" className="shell" tabIndex={-1} inert={!!sheet}>
        <header className="topline">
          <div>
            <div className="brand-lockup">
              <img className="brand-logo" src="/icons/icon-192.png" alt="" width="36" height="36" />
              <div className="brand">OS <span>SYLVAR</span></div>
            </div>
            <div className="tagline">
              صحتك... بأسلوب حياتك{" "}
              <span className="demo-label">{mode === "demo" ? "نموذج تجريبي" : "وضع شخصي"}</span>
            </div>
          </div>
          <button
            className="avatar"
            onClick={() => open("profile")}
            aria-label="الملف الشخصي"
          >
            <Icon name="person" />
          </button>
        </header>
        {notice && <div className="toast" role="status" aria-live="polite">{notice}</div>}
        {readBlocked && <p role="alert" className="nav-message">تعذر فتح بياناتك الشخصية. لم نغيّر السجلات المحفوظة؛ أعد تحميل التطبيق أو استعد نسخة احتياطية.</p>}
        {!ready ? <p role="status">جارٍ تحميل بياناتك…</p> : page === "التغذية" ? (
          <Nutrition />
        ) : page === "النشاط" ? (
          <Activity />
        ) : page === "التمارين" ? (
          <Training />
        ) : page === "التقدم" ? (
          <Progress />
        ) : (
          <Dashboard />
        )}
        <PwaStatus />
      </main>
      <nav className="bottom" aria-label="التنقل الرئيسي" inert={!!sheet}>
        {pages.slice(0, 2).map(nav)}
        <button
          className="plus"
          onClick={() => open("quick")}
          aria-label="إضافة سريعة"
        >
          +
        </button>
        {pages.slice(2).map(nav)}
      </nav>
      <Dialogs />
    </>
  );
}
export function App({ personalRepository }: { personalRepository?: ReturnType<typeof createPersonalRepository> } = {}) {
  return (
    <DemoProvider repository={personalRepository}>
      <Interface />
    </DemoProvider>
  );
}
