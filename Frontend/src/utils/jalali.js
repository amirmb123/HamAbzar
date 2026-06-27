import jalaali from "jalaali-js";
import { toPersianDigits } from "./format";

const JALALI_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const WEEKDAY_LABELS = ["ش", "ی", "د", "س", "چ", "پ", "ج"]; // شنبه تا جمعه

/** تبدیل تاریخ میلادی (Date یا رشته ISO "YYYY-MM-DD") به آبجکت شمسی {jy, jm, jd} */
export function toJalali(dateInput) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** تبدیل تاریخ شمسی {jy, jm, jd} به رشته ISO میلادی "YYYY-MM-DD" — برای مقایسه با mockAvailability */
export function jalaliToIsoString(jy, jm, jd) {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  const pad = (n) => String(n).padStart(2, "0");
  return `${gy}-${pad(gm)}-${pad(gd)}`;
}

/** نام ماه شمسی به فارسی → "دی ۱۴۰۳" */
export function formatJalaliMonthLabel(jy, jm) {
  return `${JALALI_MONTH_NAMES[jm - 1]} ${toPersianDigits(jy)}`;
}

/** تعداد روزهای یک ماه شمسی (با احتساب کبیسه) */
export function jalaliMonthLength(jy, jm) {
  return jalaali.jalaaliMonthLength(jy, jm);
}

/** روز هفته (۰=شنبه ... ۶=جمعه) برای اولین روز یک ماه شمسی، برای چیدمان گرید تقویم */
export function jalaliFirstDayOfWeek(jy, jm) {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, 1);
  const jsDay = new Date(gy, gm - 1, gd).getDay(); // ۰=یکشنبه در جاوااسکریپت
  return (jsDay + 1) % 7; // تبدیل به مبنای ۰=شنبه
}

export { WEEKDAY_LABELS };

/** تاریخ شمسی امروز */
export function getTodayJalali() {
  const now = new Date();
  return jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
