import { useMemo, useState } from "react";
import {
  jalaliMonthLength,
  jalaliFirstDayOfWeek,
  getTodayJalali,
} from "./jalali";

/** ساخت آرایه‌ی سلول‌های یک ماه شمسی (null برای جاهای خالی ابتدای ماه) */
export function buildMonthCells(jy, jm) {
  const monthLength = jalaliMonthLength(jy, jm);
  const firstDayOffset = jalaliFirstDayOfWeek(jy, jm);
  const cells = Array.from({ length: firstDayOffset }, () => null);
  for (let d = 1; d <= monthLength; d++) cells.push(d);
  return cells;
}

/** یک ماه به جلو یا عقب حرکت می‌کند و سال/ماه جدید را برمی‌گرداند */
export function shiftMonth(jy, jm, delta) {
  let newMonth = jm + delta;
  let newYear = jy;
  if (newMonth > 12) {
    newMonth = 1;
    newYear += 1;
  } else if (newMonth < 1) {
    newMonth = 12;
    newYear -= 1;
  }
  return { jy: newYear, jm: newMonth };
}

/**
 * منطق مشترک تقویم انتخاب بازه‌ی تاریخ.
 *
 * onMonthChange?: (jy: number, jm: number) => void
 *   هر بار که کاربر ماه را عوض کند، ماه شمسی جدید را برمی‌گرداند.
 *   صفحه‌های والد می‌توانند از این برای fetch availability ماه جدید استفاده کنند.
 */
export function useDateRangeCalendar(bookedDates = [], range, onRangeChange, onMonthChange) {
  const today = getTodayJalali();

  // ✅ اصلاح: ماه نمایش از ماه جاری شروع می‌شه نه از اولین bookedDate
  const [viewYear, setViewYear] = useState(today.jy);
  const [viewMonth, setViewMonth] = useState(today.jm);

  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);

  const goToPrevMonth = () => {
    const { jy, jm } = shiftMonth(viewYear, viewMonth, -1);
    setViewYear(jy);
    setViewMonth(jm);
    onMonthChange?.(jy, jm);
  };

  const goToNextMonth = () => {
    const { jy, jm } = shiftMonth(viewYear, viewMonth, 1);
    setViewYear(jy);
    setViewMonth(jm);
    onMonthChange?.(jy, jm);
  };

  const handleDayClick = (iso) => {
    if (bookedSet.has(iso)) return;

    if (!range.start || (range.start && range.end)) {
      onRangeChange({ start: iso, end: null });
    } else if (iso > range.start) {
      onRangeChange({ start: range.start, end: iso });
    } else {
      onRangeChange({ start: iso, end: range.start });
    }
  };

  const getDayState = (iso) => {
    const isBooked = bookedSet.has(iso);
    const isSelectedEdge = iso === range.start || iso === range.end;
    const isInRange = range.start && range.end && iso > range.start && iso < range.end;
    return { isBooked, isSelectedEdge, isInRange };
  };

  return {
    today,
    viewYear,
    viewMonth,
    setViewYear,
    setViewMonth,
    bookedSet,
    goToPrevMonth,
    goToNextMonth,
    handleDayClick,
    getDayState,
  };
}
