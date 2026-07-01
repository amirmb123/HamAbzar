import { useState } from "react";
import Button from "../common/Button";

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 2000;

/**
 * فرم ثبت شکایت برای یک رزرو — توسط صاحب ابزار یا اجاره‌گیرنده.
 * مطابق DisputeCreateSerializer سمت بک‌اند: فقط فیلد reason (۱۰ تا ۲۰۰۰ کاراکتر).
 */
export default function DisputeFormModal({ rental, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const trimmedLength = reason.trim().length;
  const isValid = trimmedLength >= MIN_REASON_LENGTH && trimmedLength <= MAX_REASON_LENGTH;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
    } catch (err) {
      setError(err.message || "ثبت شکایت ناموفق بود. دوباره تلاش کنید.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[440px] rounded-lg bg-white p-5">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-xl text-danger-600">
          <i className="fa-solid fa-flag" />
        </div>
        <div className="mb-1 text-center text-md font-semibold text-gray-900">
          ثبت شکایت برای «{rental.tool.name}»
        </div>
        <p className="mb-4 text-center text-sm text-gray-500">
          کد رزرو: #{rental.id} — توضیح دهید مشکل چه بوده تا تیم پشتیبانی بررسی کند.
        </p>

        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="مثلاً: ابزار آسیب‌دیده تحویل گرفته شد یا در تاریخ مقرر بازگردانده نشد..."
          maxLength={MAX_REASON_LENGTH}
          className="mb-1 w-full resize-none rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary-600"
        />
        <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
          <span>حداقل ۱۰ کاراکتر</span>
          <span>{trimmedLength} / {MAX_REASON_LENGTH}</span>
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" full onClick={onCancel} disabled={isSubmitting}>
            انصراف
          </Button>
          <Button variant="danger" full disabled={!isValid || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? "در حال ثبت..." : "ثبت شکایت"}
          </Button>
        </div>
      </div>
    </div>
  );
}
