import { useRef, useState } from "react";
import { useDemo } from "../state/DemoContext";
import { day, earnedMinutes, fmt, moves, uid } from "../domain/rules";
export function PlanB() {
  const { data, sheet, setSheet, update } = useDemo();
  const [duration, setDuration] = useState(5),
    [move, setMove] = useState(0),
    [skipped, setSkipped] = useState<number[]>([]);
  const recorded = useRef(false);
  const sequence = moves(data.settings, duration),
    current = sequence[move],
    earned = earnedMinutes(duration, skipped);
  const next = () => {
    if (move < sequence.length - 1) setMove(move + 1);
    else setSheet("finish");
  };
  if (sheet === "plan")
    return (
      <>
        <h2>جلسة منزلية بسيطة</h2>
        <p>
          اختيارية، بسيطة ودون معدات، لمستوى {data.settings.level}. القيود التي
          حددتها تتقدم على المستوى. لا تغيّر جدولك الأساسي.
        </p>
        <div className="durations">
          {[5, 10, 15].map((n) => (
            <button
              key={n}
              onClick={() => setDuration(n)}
              className={duration === n ? "selected" : ""}
              aria-pressed={duration === n}
            >
              {n} دقائق
            </button>
          ))}
        </div>
        <ol className="moves">
          {sequence.map((m, i) => (
            <li key={i}>
              <strong>
                {i + 1}. {m.name}
              </strong>
              <span>
                {m.dose} — {m.detail}
              </span>
            </li>
          ))}
        </ol>
        <div className="safety">
          توقف عند ألم أو دوار أو ضيق نفس غير معتاد. يمكنك تخطي الجلسة كلها دون
          تسجيل.
        </div>
        <button
          className="wide"
          onClick={() => {
            setMove(0);
            setSkipped([]);
            setSheet("exercise");
          }}
        >
          ابدأ الجلسة
        </button>
      </>
    );
  if (sheet === "exercise")
    return (
      <>
        <div className="counter">
          الحركة {move + 1} من {sequence.length} · جلسة {duration} دقائق
        </div>
        <div className="move-large">
          <b>{current.name}</b>
          <div className="time">{current.dose}</div>
          <p>{current.detail}</p>
        </div>
        <div className="safety">
          التنقل يدوي. لا يقيس التطبيق الوقت أو الأداء؛ عند النهاية تؤكد بنفسك
          ما أكملته. توقف عند ألم أو دوار.
        </div>
        <div className="sheet-actions">
          <button
            className="pill"
            disabled={move === 0}
            onClick={() => setMove(Math.max(0, move - 1))}
          >
            السابق
          </button>
          <button className="wide" onClick={next}>
            {move === sequence.length - 1 ? "إنهاء الجلسة" : "التالي"}
          </button>
        </div>
        <button
          className="text-btn"
          onClick={() => {
            setSkipped((s) => (s.includes(move) ? s : [...s, move]));
            next();
          }}
        >
          تخطي هذه الحركة
        </button>
      </>
    );
  return (
    <div className="success">
      <h2>انتهى تسلسل الحركات</h2>
      <p>
        هل أكملت الحركات غير المتخطاة؟ لم يُسجّل أي نشاط حتى تؤكد. الدقائق
        المقدرة: {fmt(earned)} من {fmt(duration)}.
      </p>
      <button
        className="wide"
        disabled={earned === 0}
        onClick={() => {
          if (earned <= 0 || recorded.current) return;
          recorded.current = true;
          update((d) => {
            d.homeSessions.push({
              id: uid(),
              date: day(),
              minutes: earned,
              planned: duration,
              skipped: skipped.length,
            });
          }, `تم تسجيل ${earned} دقيقة منزلية بإقرارك.`);
          setSheet(null);
        }}
      >
        أكملت، سجّل نشاطي ({fmt(earned)} دقائق)
      </button>
      <p>
        <button className="pill" onClick={() => setSheet(null)}>
          خروج دون تسجيل
        </button>
      </p>
    </div>
  );
}
