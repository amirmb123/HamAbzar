import { toPersianDigits } from "./format";

/**
 * فرمت نسبی زمان آخرین پیام، مطابق نمونه‌های طراحی:
 * امروز → ساعت دقیق ("۱۰:۲۸")، دیروز → "دیروز"، تا ۶ روز → "N روز پیش"،
 * بیشتر → "N هفته پیش".
 *
 * ⚠️ نکته: "امروز" بر مبنای تاریخ واقعی سیستم محاسبه می‌شود. mock data این
 * صفحه عمداً نزدیک به تاریخ فعلی نگه داشته شده (بر خلاف mockAvailability
 * که برای یک بازه‌ی ثابت گذشته ساخته شده بود) تا این فرمت نسبی درست از کار
 * بیفتد بدون نیاز به منطق "ماه شاهد" مثل تقویم.
 */
export function formatRelativeChatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return toPersianDigits(
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    );
  }
  if (diffDays === 1) return "دیروز";
  if (diffDays < 7) return `${toPersianDigits(diffDays)} روز پیش`;
  const weeks = Math.floor(diffDays / 7);
  return `${toPersianDigits(weeks)} هفته پیش`;
}

/** فرمت ساعت دقیق برای داخل بابل پیام → "۱۰:۲۲" */
export function formatMessageTime(isoString) {
  const date = new Date(isoString);
  return toPersianDigits(
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
  );
}
