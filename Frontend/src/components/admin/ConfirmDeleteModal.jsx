import Button from "../common/Button";

export default function ConfirmDeleteModal({ toolName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[400px] rounded-lg bg-white p-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-xl text-danger-600">
          <i className="fa-solid fa-trash" />
        </div>
        <div className="mb-1 text-md font-semibold text-gray-900">حذف «{toolName}»؟</div>
        <p className="mb-5 text-sm text-gray-500">این عملیات غیرقابل برگشت است و آگهی برای همیشه حذف می‌شود.</p>

        <div className="flex gap-2">
          <Button variant="outline" full onClick={onCancel}>
            انصراف
          </Button>
          <Button variant="danger" full onClick={onConfirm}>
            بله، حذف شود
          </Button>
        </div>
      </div>
    </div>
  );
}
