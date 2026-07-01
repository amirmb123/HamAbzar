import { useState } from "react";
import Button from "../common/Button";
import { toPersianDigits } from "../../utils/format";

const MIN_RESOLUTION_LENGTH = 5;

/**
 * فرم رسیدگی به شکایت — مطابق DisputeResolveSerializer سمت بک‌اند:
 * resolution (۵ تا ۲۰۰۰ کاراکتر، اجباری) و penalty_amount (اختیاری، پیش‌فرض ۰).
 * بک‌اند خودش بررسی می‌کند که penalty_amount از مبلغ ودیعه بیشتر نباشد؛
 * در صورت خطا، پیام دقیق سرور همینجا نمایش داده می‌شود.
 */
export default function ResolveDisputeModal({ dispute, onConfirm, onCancel }) {
  const [resolution, setResolution] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isValid = resolution.trim().length >= MIN_RESOLUTION_LENGTH;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm({
        resolution: resolution.trim(),
        penalty_amount: Number(penaltyAmount) || 0,
      });
    } catch (err) {
      setError(err.message || "رسیدگی به شکایت ناموفق بود. دوباره تلاش کنید.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[460px] rounded-lg bg-white p-5">
        <div className="mb-1 text-md font-semibold text-gray-900">
          رسیدگی به شکایت رزرو #{toPersianDigits(dispute.rental_id)}
        </div>
        <p className="mb-3 text-sm text-gray-500">
          شاکی: {dispute.raised_by.full_name}
        </p>

        <div className="mb-4 rounded-md bg-gray-50 p-3 text-sm leading-6 text-gray-700">
          {dispute.reason}
        </div>

        <label className="mb-2 block text-sm font-medium text-gray-900">
          نتیجه رسیدگی <span className="text-danger-600">*</span>
        </label>
        <textarea
          rows={3}
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="توضیح دهید تصمیم نهایی چیست و چرا..."
          className="mb-4 w-full resize-none rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary-600"
        />

        <label className="mb-2 block text-sm font-medium text-gray-900">مبلغ جریمه (تومان)</label>
        <input
          type="number"
          min={0}
          value={penaltyAmount}
          onChange={(e) => setPenaltyAmount(e.target.value)}
          placeholder="۰"
          className="mb-1 w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary-600"
        />
        <p className="mb-4 text-xs text-gray-400">
          از ودیعه‌ی این رزرو کسر و به صاحب ابزار پرداخت می‌شود. اگر تخلفی نبوده، عدد را صفر بگذارید.
        </p>

        {error && (
          <p className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" full onClick={onCancel} disabled={isSubmitting}>
            انصراف
          </Button>
          <Button variant="primary" full disabled={!isValid || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? "در حال ثبت..." : "ثبت نتیجه و بستن شکایت"}
          </Button>
        </div>
      </div>
    </div>
  );
}
