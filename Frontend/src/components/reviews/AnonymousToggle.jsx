export default function AnonymousToggle({ isPublic, onChange }) {
  return (
    <div className="mb-6 flex items-center justify-between rounded-md bg-gray-50 p-3">
      <div>
        <div className="text-base font-medium text-gray-900">نمایش نام من در نظر</div>
        <div className="text-xs text-gray-500">در صورت غیرفعال بودن، نظر شما ناشناس ثبت می‌شود</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!isPublic)}
        className={`relative h-6 w-[42px] shrink-0 rounded-full transition ${
          isPublic ? "bg-primary-600" : "bg-gray-200"
        }`}
      >
        <div
          className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all ${
            isPublic ? "right-[21px]" : "right-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
