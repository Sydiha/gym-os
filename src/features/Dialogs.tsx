import { useDemo } from "../state/DemoContext";
import { Dialog } from "../ui/Dialog";
import { EntryForm } from "./EntryForms";
import { Restaurant } from "./Nutrition";
import { Profile } from "./Settings";
import { PlanB } from "./PlanB";
export function Dialogs() {
  const { sheet, closeSheet, opener, open, water, editing } = useDemo();
  if (!sheet) return null;
  return (
    <Dialog close={closeSheet} opener={opener} stage={sheet}>
      {sheet === "meal" ? (
        <EntryForm key={`meal-${editing?.record.id ?? "new"}`} kind="meal" editing={editing?.kind === "meal" ? editing.record : undefined} />
      ) : sheet === "activity" ? (
        <EntryForm key={`activity-${editing?.record.id ?? "new"}`} kind="activity" editing={editing?.kind === "activity" ? editing.record : undefined} />
      ) : sheet === "weight" ? (
        <EntryForm key={`weight-${editing?.record.id ?? "new"}`} kind="weight" editing={editing?.kind === "weight" ? editing.record : undefined} />
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
