import { useEffect, useState } from "react";
import { day } from "../domain/rules";

/** Re-render date-dependent views after midnight or when the PWA resumes. */
export function useCurrentDay() {
  const [today, setToday] = useState(day);
  useEffect(() => {
    const refresh = () => setToday(day());
    const interval = window.setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return today;
}
