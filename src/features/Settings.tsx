import { useEffect, useState } from "react";
import { useDemo } from "../state/DemoContext";
import { emptyDemo, seed } from "../domain/fixtures";
import type { DemoData, Settings } from "../domain/types";
import { parseBackup } from "../state/personalStorage";
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
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              update((d) => { d.settings[key] = checked; });
            }}
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
          onChange={(e) => {
            const value = e.currentTarget.value as Settings["expected"];
            update((d) => { d.settings.expected = value; });
          }}
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
          onChange={(e) => {
            const value = e.currentTarget.value as Settings["dayType"];
            update((d) => { d.settings.dayType = value; });
          }}
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
  const { data, update, mode, setMode, restorePersonal, exportPersonalBackup, report, readBlocked, ready } = useDemo();
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("حجم ملف النسخة الاحتياطية كبير جدًا (الحد 10 ميجابايت).");
      const backup = parseBackup(JSON.parse(await file.text()));
      const count = backup.data.meals.length + backup.data.activities.length + backup.data.weights.length + backup.data.homeSessions.length;
      if (!window.confirm(`ستُستبدل السجلات الشخصية الحالية. تحتوي النسخة على ${count} سجلًا و${backup.data.favorites.length} وجبة مفضلة. هل تريد المتابعة؟`)) return;
      await restorePersonal(backup.data);
    } catch (error) { alert(error instanceof Error ? error.message : "تعذر قراءة ملف النسخة الاحتياطية."); }
  }
  async function exportFile() {
    try {
      const backup = await exportPersonalBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "gym-os-backup.json"; link.click(); URL.revokeObjectURL(link.href);
    } catch { report("تعذر تصدير النسخة الاحتياطية. لم يُنزّل ملف؛ تحقّق من التخزين وحاول الاستعادة أو التحميل مجددًا."); }
  }
  return (
    <>
      <h2>الملف والإعدادات</h2>
      <label>وضع الاستخدام
        <select value={mode} onChange={(e) => setMode(e.target.value as "personal" | "demo")}>
          <option value="personal">الوضع الشخصي — بياناتي</option><option value="demo">العرض التجريبي — بيانات نموذجية</option>
        </select>
      </label>
      <p>
        {mode === "demo" ? "بيانات العرض التجريبي مستقلة عن بياناتك الشخصية. " : "بياناتك محفوظة على هذا الجهاز في المتصفح. "}اختيار المستوى يغيّر
        صياغة الواجهة؛ قيود الركبة والكتف تضبط بديل المنزل.
      </p>
      {mode === "personal" && <CalorieGoal value={data.goal} update={update} />}
      <label>
        المستوى
        <select
          value={data.settings.level}
          onChange={(e) => {
            const value = e.currentTarget.value as Settings["level"];
            update((d) => { d.settings.level = value; });
          }}
        >
          {["مبتدئ", "متوسط", "متقدم"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <Constraints prefix="profile" />
      {mode === "personal" && <>
        <h3>النسخ الاحتياطي والاستعادة</h3>
        <p className="note">قد تُمسح مساحة تخزين المتصفح عند حذف بياناته أو تغيير الجهاز. احتفظ بنسخة احتياطية في مكان آمن؛ لا يرسلها التطبيق إلى أي جهة.</p>
        <button className="outline" disabled={!ready || readBlocked} onClick={exportFile}>تصدير نسخة احتياطية</button>
        <label lang="ar" dir="rtl">استعادة نسخة JSON احتياطية<input lang="ar" dir="rtl" type="file" accept="application/json,.json" disabled={!ready} onChange={(e) => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ""; void importFile(file); }} /></label>
      </>}
      <p className="note">لا توجد حسابات حقيقية أو تسجيل دخول في هذه النسخة.</p>
    </>
  );
}


function CalorieGoal({ value, update }: { value: number; update: (change: (draft: DemoData) => void, message?: string) => void }) {
  const [input, setInput] = useState(String(value || ""));
  useEffect(() => { setInput(String(value || "")); }, [value]);
  function save() {
    const goal = input.trim() === "" ? 0 : Number(input);
    if (Number.isInteger(goal) && goal >= 0 && goal <= 10000) {
      if (goal !== value) update((data) => { data.goal = goal; });
    } else setInput(String(value || ""));
  }
  return (
    <label>هدف السعرات اليومي (اختياري)
      <input
        type="number"
        inputMode="numeric"
        min="0"
        max="10000"
        step="1"
        value={input}
        placeholder="لم يُحدّد"
        onChange={(e) => setInput(e.currentTarget.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save(); } }}
      />
    </label>
  );
}
