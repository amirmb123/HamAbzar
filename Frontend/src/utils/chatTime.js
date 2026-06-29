import { toPersianDigits } from "./format";

/** فرمت ساعت دقیق برای داخل بابل پیام → "۱۰:۲۲" */
export function formatMessageTime(isoString) {
  const date = new Date(isoString);
  return toPersianDigits(
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
  );
}
