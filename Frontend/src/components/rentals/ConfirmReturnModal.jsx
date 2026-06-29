import { useState } from "react";
import Button from "../common/Button";

/**
 * هشدار تایید قبل از ثبت بازگشت ابزار توسط صاحب ابزار.
 * چون بک‌اند هیچ تاییدی از طرف کرایه‌گیرنده نمی‌خواهد، این مرحله صرفاً یک
 * محافظ سمت فرانت است تا صاحب ابزار به‌اشتباه و قبل از پس گرفتن واقعی ابزار،
 * بازگشت را ثبت نکند (ثبت باعث آزاد شدن ودیعه و واریز هزینه می‌شود).
 */
export default function ConfirmReturnModal({ toolName, onConfirm, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message || "ثبت بازگشت ناموفق بود. دوباره تلاش کنید.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[420px] rounded-lg bg-white p-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-xl text-amber-600">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <div className="mb-1 text-md font-semibold text-gray-900">بازگشت «{toolName}» را تایید می‌کنید؟</div>
        <p className="mb-5 text-sm text-gray-500">
          این کار را فقط در صورتی تایید کنید که ابزار را واقعاً از کرایه‌گیرنده پس گرفته‌اید. با تایید، ودیعه
          به کرایه‌گیرنده بازمی‌گردد و هزینه‌ی اجاره به شما واریز می‌شود — این عملیات غیرقابل بازگشت است.
        </p>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button variant="outline" full onClick={onCancel} disabled={isSubmitting}>
            انصراف
          </Button>
          <Button variant="primary" full onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "در حال ثبت..." : "بله، بازگشت داده شد"}
          </Button>
        </div>
      </div>
    </div>
  );
}