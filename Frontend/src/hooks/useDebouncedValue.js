import { useEffect, useState } from "react";

/** دیبانس کردن یک مقدار — برای جلوگیری از فراخوانی API به ازای هر کلیدفشاری در جستجو */
export function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
