import { useState } from "react";
import Button from "../common/Button";

/**
 * هشدار تایید قبل از حذف یک آگهی ابزار — چون حذف غیرقابل بازگشت است
 * (و در صورت وجود رزرو فعال روی ابزار، بک‌اند با خطا رد می‌کند).
 */
export default function ConfirmDeleteToolModal({ toolName, onConfirm, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message || "حذف ابزار ناموفق بود. دوباره تلاش کنید.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[420px] rounded-lg bg-white p-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-xl text-danger-600">
          <i className="fa-solid fa-trash" />
        </div>
        <div className="mb-1 text-md font-semibold text-gray-900">حذف «{toolName}» را تایید می‌کنید؟</div>
        <p className="mb-5 text-sm text-gray-500">
          این عملیات غیرقابل بازگشت است. اگر این ابزار رزرو فعالی داشته باشد، حذف آن ممکن نخواهد بود.
        </p>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button variant="outline" full onClick={onCancel} disabled={isSubmitting}>
            انصراف
          </Button>
          <Button variant="danger" full onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "در حال حذف..." : "بله، حذف شود"}
          </Button>
        </div>
      </div>
    </div>
  );
}
