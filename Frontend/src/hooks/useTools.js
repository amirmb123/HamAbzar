import { useEffect, useState, useCallback } from "react";
import { fetchTools } from "../services/api";

const INITIAL_FILTERS = {
  category_id: null,
  city_id: 1, // پیش‌فرض: تهران — هماهنگ با چیپ فعال در طراحی
  search: "",
  ordering: "newest",
  only_available: false,
};

/**
 * مدیریت لیست ابزارها: فچ، فیلتر، sort و وضعیت‌های loading/error/empty.
 * این هوک مستقل از UI هست تا هم در نمای لیست و هم نقشه قابل استفاده باشه.
 */
export function useTools() {
  const [tools, setTools] = useState([]);
  const [count, setCount] = useState(0);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async (currentFilters) => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const data = await fetchTools(currentFilters);
      setTools(data.results);
      setCount(data.count);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message || "خطایی در دریافت اطلاعات رخ داد.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load(filters);
  }, [filters, load]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return {
    tools,
    count,
    filters,
    status,
    errorMessage,
    updateFilter,
    resetFilters,
    refetch: () => load(filters),
  };
}
