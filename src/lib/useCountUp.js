import { useEffect, useRef, useState } from "react";

// Animate a number from 0 -> target on mount. Respects prefers-reduced-motion.
export function useCountUp(target, { duration = 900, decimals = 0 } = {}) {
  const [value, setValue] = useState(target);
  const raf = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof target !== "number" || !isFinite(target)) {
      setValue(target);
      return;
    }
    let start;
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const step = (ts) => {
      if (start === undefined) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setValue(target * ease(p));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else setValue(target);
    };
    setValue(0);
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  const factor = Math.pow(10, decimals);
  const rounded = Math.round(value * factor) / factor;
  return rounded;
}
