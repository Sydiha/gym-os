import { useDemo } from "../state/DemoContext";
import { emptyDemo, seed } from "../domain/fixtures";
import type { Settings } from "../domain/types";
export function Constraints({ prefix }: { prefix: string }) {
  const { data, update } = useDemo();
  return (
    <div className="checks">
      {(
        [
          ["homeSuggestions", prefix === "demo" ? "تفعيل الاقتراحات المنزلية" : "تفعيل اقتراحات المنزل"],
          ["knee", prefix === "demo" ? "لدي قيد في الركبة" : "قيد في الركبة"],
          ["shoulder", prefix === "demo" ? "لدي قيد في الكتف" : "قيد في الكتف"],
        ] as const
      ).map(([key, text]) => (
        <label key={key}>
          <input
            id={`${prefix}-${key}`}
            type="checkbox"
            checked={data.settings[key]}
            onChange={(e) =>
              update((d) => {
                d.settings[key] = e.target.checked;
              })
            }
          />
          {text}
        </label>
      ))}
    </div>
  );
}
export function DemoControls() {
  const { data, update, replace, time, setTime, demoOpen, setDemoOpen } =
    useDemo();
  return (
    <details
      className="demo"
      open={demoOpen}
      onToggle={(e) => setDemoOpen(e.currentTarget.open)}
    >
      <summary>حالات العرض التجريبية والإعدادات</summary>
      <div className="field">
        <label htmlFor="clock">وقت المحاكاة</label>
        <input
          id="clock"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="expected">موعد النشاط المتوقع</label>
        <select
          id="expected"
          value={data.settings.expected}
          onChange={(e) =>
            update((d) => {
              d.settings.expected = e.target.value as Settings["expected"];
            })
          }
        >
          <option value="18:00">٦ مساءً</option>
          <option value="none">لا يوجد موعد محدد</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="dayType">نوع اليوم</label>
        <select
          id="dayType"
          value={data.settings.dayType}
          onChange={(e) =>
            update((d) => {
              d.settings.dayType = e.target.value as Settings["dayType"];
            })
          }
        >
          <option value="activity">يوم نشاط</option>
          <option value="rest">يوم راحة</option>
        </select>
      </div>
      <Constraints prefix="demo" />
      <button
        onClick={() =>
          replace(
            emptyDemo(),
            "مُسحت جميع تسجيلات Demo. يمكنك تجربة حالات البيانات الفارغة.",
          )
        }
      >
        إعادة ضبط بيانات Demo ومسح التسجيلات
      </button>{" "}
      <button
        onClick={() => replace(seed(), "استُعيدت بيانات العرض التجريبية.")}
      >
        استعادة بيانات العرض
      </button>
      <p className="note">
        الوقت والطقس تجريبيان. لا توجد إشعارات أو قراءة تلقائية للنشاط.
      </p>
    </details>
  );
}
export function Profile() {
  const { data, update } = useDemo();
  return (
    <>
      <h2>الملف والإعدادات</h2>
      <p>
        مستوى هذا الحساب التجريبي مستقل عن بيانات الأصدقاء. اختيار المستوى يغيّر
        صياغة الواجهة؛ قيود الركبة والكتف تضبط بديل المنزل.
      </p>
      <label>
        المستوى
        <select
          value={data.settings.level}
          onChange={(e) =>
            update((d) => {
              d.settings.level = e.target.value as Settings["level"];
            })
          }
        >
          {["مبتدئ", "متوسط", "متقدم"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <Constraints prefix="profile" />
      <p className="note">لا توجد حسابات حقيقية أو تسجيل دخول في هذه النسخة.</p>
    </>
  );
}
