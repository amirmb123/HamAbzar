import { useMemo, useState } from "react";
import {
  jalaliMonthLength,
  jalaliFirstDayOfWeek,
  jalaliToIsoString,
  getTodayJalali,
  toJalali,
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
 * ⚠️ نکته: ماه پیش‌فرض نمایش، ماه جاری سیستم نیست؛ ماهیه که اولین تاریخ
 * bookedDates در آن قرار دارد (به همان دلیلی که در AvailabilityCalendar
 * توضیح داده شده — mock data برای یک بازه‌ی ثابت ساخته شده، نه «همین ماه»).
 */
export function useDateRangeCalendar(bookedDates = [], range, onRangeChange) {
  const today = getTodayJalali();
  const firstBookedJalali = bookedDates.length > 0 ? toJalali(bookedDates[0]) : today;

  const [viewYear, setViewYear] = useState(firstBookedJalali.jy);
  const [viewMonth, setViewMonth] = useState(firstBookedJalali.jm);

  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);

  const goToPrevMonth = () => {
    const { jy, jm } = shiftMonth(viewYear, viewMonth, -1);
    setViewYear(jy);
    setViewMonth(jm);
  };

  const goToNextMonth = () => {
    const { jy, jm } = shiftMonth(viewYear, viewMonth, 1);
    setViewYear(jy);
    setViewMonth(jm);
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
