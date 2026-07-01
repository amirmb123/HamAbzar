import { useEffect, useState, useCallback } from "react";
import { fetchMyTransactions } from "../services/api";

const TYPE_OPTIONS = [
  { value: null,              label: "همه" },
  { value: "rental_payment",  label: "اجاره" },
  { value: "deposit_hold",    label: "ودیعه" },
  { value: "deposit_return",  label: "بازگشت ودیعه" },
  { value: "deposit_penalty", label: "جریمه ودیعه" },
];

/**
 * تاریخچه‌ی تراکنش‌های مالی کاربر — با فیلتر نوع/جهت و صفحه‌بندی به‌صورت
 * "بارگذاری بیشتر" (به‌جای شماره صفحه، چون برای یک لیست پویا در پروفایل مناسب‌تره).
 */
export function useMyTransactions() {
  const [typeFilter, setTypeFilter] = useState(null);
  const [directionFilter, setDirectionFilter] = useState(null);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const load = useCallback((pageNum, { append } = {}) => {
    const setter = append ? setIsLoadingMore : setStatus;
    setter(append ? true : "loading");

    const params = { page: pageNum };
    if (typeFilter) params.type = typeFilter;
    if (directionFilter) params.direction = directionFilter;

    fetchMyTransactions(params)
      .then(({ items: newItems, pagination }) => {
        setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        setHasMore(Boolean(pagination?.next));
        setPage(pageNum);
        if (!append) setStatus("success");
      })
      .catch(() => {
        if (!append) setStatus("error");
      })
      .finally(() => {
        if (append) setIsLoadingMore(false);
      });
  }, [typeFilter, directionFilter]);

  // بارگذاری اولیه یا وقتی فیلترها تغییر کنن
  useEffect(() => {
    load(1);
  }, [load]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    load(page + 1, { append: true });
  }, [hasMore, isLoadingMore, page, load]);

  return {
    items,
    status,
    hasMore,
    isLoadingMore,
    loadMore,
    typeFilter,
    setTypeFilter,
    directionFilter,
    setDirectionFilter,
    typeOptions: TYPE_OPTIONS,
    refetch: () => load(1),
  };
}
