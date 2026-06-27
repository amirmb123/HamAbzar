const VARIANTS = {
  empty: {
    icon: "fa-solid fa-box-open",
    title: "ابزاری ثبت نشده",
    desc: "هنوز هیچ ابزاری در این محدوده ثبت نشده. اولین نفر باشید!",
    actionLabel: "ثبت ابزار",
  },
  noResult: {
    icon: "fa-solid fa-magnifying-glass",
    title: "نتیجه‌ای پیدا نشد",
    desc: "جستجوی خود را تغییر دهید یا فیلترها را بردارید",
    actionLabel: "پاک‌سازی فیلترها",
  },
  error: {
    icon: "fa-solid fa-triangle-exclamation",
    title: "ارتباط برقرار نشد",
    desc: "مشکلی در دریافت اطلاعات پیش آمد. لطفاً دوباره تلاش کنید.",
    actionLabel: "تلاش دوباره",
  },
  emptyRentals: {
    icon: "fa-solid fa-bag-shopping",
    title: "هنوز رزروی ثبت نشده",
    desc: "وقتی ابزاری رزرو کنید یا کسی ابزار شما را اجاره کند، اینجا نمایش داده می‌شود",
    actionLabel: "مشاهده ابزارها",
  },
};

export default function StateMessage({ variant, onAction }) {
  const config = VARIANTS[variant];
  if (!config) return null;

  return (
    <div className="flex h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
      <i className={`${config.icon} mb-4 text-[48px] text-gray-500 opacity-35`} />
      <div className="mb-2 text-lg font-medium text-gray-900">{config.title}</div>
      <p className="max-w-[240px] text-base leading-relaxed text-gray-500">{config.desc}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
        >
          {config.actionLabel}
        </button>
      )}
    </div>
  );
}
