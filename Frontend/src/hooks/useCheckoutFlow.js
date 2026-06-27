import { useState } from "react";

/**
 * مدیریت state فلوی checkout. range می‌تونه از صفحه‌ی جزئیات ابزار
 * (با query param یا state ناوبری) از پیش پر شده باشه.
 *
 * نکته‌ی مهم: طبق طراحی، تقویم (مرحله ۱) و روش تحویل (مرحله ۲) همزمان
 * در یک صفحه نمایش داده می‌شن (نه این‌که با کلیک جدا شن). استپر صرفاً
 * نشانگر پیشرفته: وقتی بازه‌ی تاریخ کامل انتخاب شده، مرحله ۱ «تیک‌خورده»
 * و مرحله ۲ «فعال» می‌شه. به همین خاطر currentStep از روی range محاسبه
 * می‌شه، نه یک state مستقل.
 */
export function useCheckoutFlow(initialRange = { start: null, end: null }) {
  const [range, setRange] = useState(initialRange);
  const [timeSlotId, setTimeSlotId] = useState("noon");
  const [deliveryMethodId, setDeliveryMethodId] = useState("in_person");

  const hasValidRange = Boolean(range.start && range.end);
  const currentStep = hasValidRange ? 2 : 1;

  const goToPaymentStep = () => {
    // مراحل ۳ و ۴ (پرداخت و تأیید نهایی) فعلاً طراحی نشدن.
    // وقتی صفحه‌شون آماده شد، این تابع باید واقعاً به مسیر بعدی هدایت کند.
    console.log("ادامه به پرداخت:", { range, timeSlotId, deliveryMethodId });
  };

  return {
    currentStep,
    range,
    setRange,
    timeSlotId,
    setTimeSlotId,
    deliveryMethodId,
    setDeliveryMethodId,
    hasValidRange,
    goToPaymentStep,
  };
}
