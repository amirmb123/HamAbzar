import { useState } from "react";
import Button from "../common/Button";

export default function RejectReasonModal({ toolName, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[420px] rounded-lg bg-white p-5">
        <div className="mb-1 text-md font-semibold text-gray-900">رد کردن آگهی</div>
        <p className="mb-4 text-sm text-gray-500">
          دلیل رد «{toolName}» را بنویسید تا برای صاحب ابزار ارسال شود.
        </p>

        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="مثلاً: تصاویر کافی نیست یا توضیحات ناقص است..."
          className="mb-4 w-full resize-none rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary-600"
        />

        <div className="flex gap-2">
          <Button variant="outline" full onClick={onCancel}>
            انصراف
          </Button>
          <Button variant="danger" full disabled={!reason.trim()} onClick={() => onConfirm(reason)}>
            رد آگهی
          </Button>
        </div>
      </div>
    </div>
  );
}
