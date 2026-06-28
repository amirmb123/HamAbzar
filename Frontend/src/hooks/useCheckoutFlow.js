import { useState } from "react";
import { createRental } from "../services/api";

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
export function useCheckoutFlow(toolId, initialRange = { start: null, end: null }) {
  const [range, setRange] = useState(initialRange);
  const [timeSlotId, setTimeSlotId] = useState("noon");
  const [deliveryMethodId, setDeliveryMethodId] = useState("in_person");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const hasValidRange = Boolean(range.start && range.end);
  const currentStep = hasValidRange ? 2 : 1;

  /**
   * ثبت رزرو واقعی روی بک‌اند (POST /api/rentals/).
   * توجه: روش تحویل و ساعت تحویل فعلاً فقط نمایشی‌اند — بک‌اند هیچ
   * فیلدی برای اینها ندارد و مبلغ نهایی صرفاً daily_price × روز + ودیعه است
   * (بدون کارمزد پلتفرم یا هزینه‌ی تحویل، چون این‌ها هنوز سمت بک‌اند پیاده نشده‌اند).
   * @returns {Promise<{success: boolean, rentalId?: number}>}
   */
  const goToPaymentStep = async () => {
    if (!hasValidRange) return { success: false };
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await createRental({
        tool_id: Number(toolId),
        start_date: range.start,
        end_date: range.end,
      });
      return { success: true, rentalId: res.data.id };
    } catch (err) {
      setErrorMessage(err.message || "خطا در ثبت رزرو. دوباره تلاش کنید.");
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
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
    isSubmitting,
    errorMessage,
    goToPaymentStep,
  };
}