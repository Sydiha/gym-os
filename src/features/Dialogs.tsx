import { useDemo } from "../state/DemoContext";
import { Dialog } from "../ui/Dialog";
import { EntryForm } from "./EntryForms";
import { Restaurant } from "./Nutrition";
import { Profile } from "./Settings";
import { PlanB } from "./PlanB";
export function Dialogs() {
  const { sheet, setSheet, opener, open, water } = useDemo();
  if (!sheet) return null;
  return (
    <Dialog close={() => setSheet(null)} opener={opener} stage={sheet}>
      {sheet === "meal" || sheet === "activity" || sheet === "weight" ? (
        <EntryForm key={sheet} kind={sheet} />
      ) : sheet === "restaurant" ? (
        <Restaurant />
      ) : sheet === "profile" ? (
        <Profile />
      ) : sheet === "quick" ? (
        <>
          <h2>إضافة سريعة</h2>
          <div className="quick-list">
            <button className="outline" onClick={() => open("meal")}>
              سجّل وجبة
            </button>
            <button className="outline" onClick={water}>
              أضف كوب ماء
            </button>
            <button className="outline" onClick={() => open("activity")}>
              سجّل نشاطًا
            </button>
            <button className="outline" onClick={() => open("weight")}>
              سجّل الوزن
            </button>
          </div>
        </>
      ) : (
        <PlanB />
      )}
    </Dialog>
  );
}
