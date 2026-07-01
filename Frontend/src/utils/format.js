/** تبدیل اعداد انگلیسی به فارسی برای نمایش */
export function toPersianDigits(value) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

/** فرمت قیمت تومانی با جداکننده هزارگان و اعداد فارسی → "۸۰,۰۰۰ تومان" */
export function formatPrice(amount) {
  const formatted = Number(amount).toLocaleString("en-US");
  return `${toPersianDigits(formatted)} تومان`;
}

/** فرمت کوتاه قیمت برای جاهایی که فضای کم است → "۳۹۸,۰۰۰ ت" */
export function formatPriceShort(amount) {
  const formatted = Number(amount).toLocaleString("en-US");
  return `${toPersianDigits(formatted)} ت`;
}

/** فرمت فاصله کیلومتری → "۱.۲ کیلومتر" */
export function formatDistance(km) {
  return `${toPersianDigits(km)} کیلومتر`;
}

/** فرمت امتیاز با یک رقم اعشار فارسی → "۴.۸" */
export function formatRating(rating) {
  return toPersianDigits(Number(rating).toFixed(1));
}

/** فرمت تاریخ و ساعت شمسی → "۱۲ خرداد ۱۴۰۴ - ۱۴:۳۰" */
export function formatDateTime(iso) {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("fa-IR", { day: "numeric", month: "long", year: "numeric" });
  const timePart = date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  return `${datePart} - ${timePart}`;
}
