import { useEffect, useState, useCallback } from "react";
import {
  fetchToolDetail,
  fetchToolAvailability,
  fetchToolReviews,
} from "../services/api";
import { getTodayJalali } from "../utils/jalali";

/**
 * ماه جاری شمسی را به فرمت "YYYY-MM" میلادی برمی‌گرداند
 * (همان فرمتی که بک‌اند انتظار دارد: ?month=YYYY-MM)
 */
function getCurrentGregorianMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * یک ماه به جلو را به فرمت "YYYY-MM" میلادی برمی‌گرداند
 */
function getNextGregorianMonth() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function useToolDetail(toolId) {
  const [tool, setTool] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [reviewsData, setReviewsData] = useState(null);

  const [toolStatus, setToolStatus] = useState("loading"); // loading | success | error
  const [reviewsStatus, setReviewsStatus] = useState("loading");

  /**
   * هر بار که کاربر در تقویم ماه را عوض کند، این تابع صدا زده می‌شود.
   * month: رشته "YYYY-MM" میلادی
   */
  const fetchAvailabilityForMonths = useCallback(
    async (currentMonth, nextMonth) => {
      try {
        const [res1, res2] = await Promise.all([
          fetchToolAvailability(toolId, currentMonth),
          fetchToolAvailability(toolId, nextMonth),
        ]);
        const merged = [
          ...(res1?.booked_dates ?? []),
          ...(res2?.booked_dates ?? []),
        ];
        // حذف تکراری‌ها
        setBookedDates([...new Set(merged)]);
      } catch {
        // در صورت خطا تقویم خالی نشون داده می‌شه (همان رفتار قبلی)
        setBookedDates([]);
      }
    },
    [toolId]
  );

  useEffect(() => {
    let cancelled = false;

    setToolStatus("loading");
    fetchToolDetail(toolId)
      .then((data) => {
        if (cancelled) return;
        setTool(data);
        setToolStatus("success");

        // ✅ اصلاح: month را پاس می‌دهیم — بدون آن بک‌اند 400 برمی‌گرداند
        const currentMonth = getCurrentGregorianMonth();
        const nextMonth = getNextGregorianMonth();
        return fetchAvailabilityForMonths(currentMonth, nextMonth);
      })
      .catch(() => {
        if (!cancelled) setToolStatus("error");
      });

    setReviewsStatus("loading");
    fetchToolReviews(toolId)
      .then((data) => {
        if (cancelled) return;
        setReviewsData(data);
        setReviewsStatus("success");
      })
      .catch(() => {
        if (!cancelled) setReviewsStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [toolId, fetchAvailabilityForMonths]);

  return {
    tool,
    toolStatus,
    bookedDates,
    fetchAvailabilityForMonths, // ← export می‌شه تا تقویم بتونه ماه جدید fetch کنه
    reviewsData,
    reviewsStatus,
  };
}
