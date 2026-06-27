import Avatar from "../common/Avatar";

const NAV_GROUPS = [
  {
    label: "داشبورد",
    items: [
      { id: "overview", icon: "fa-solid fa-chart-pie", title: "نمای کلی", active: true },
      { id: "reports", icon: "fa-solid fa-chart-line", title: "گزارش‌ها و آمار" },
    ],
  },
  {
    label: "مدیریت محتوا",
    items: [
      { id: "tools", icon: "fa-solid fa-toolbox", title: "ابزارها" },
      { id: "users", icon: "fa-regular fa-user", title: "کاربران" },
      { id: "reviews", icon: "fa-regular fa-star", title: "نظرات و امتیازها" },
      { id: "violations", icon: "fa-solid fa-flag", title: "گزارش‌های تخلف", badge: 3 },
    ],
  },
  {
    label: "عملیات",
    items: [
      { id: "rentals", icon: "fa-regular fa-calendar-check", title: "رزروها" },
      { id: "transactions", icon: "fa-solid fa-wallet", title: "تراکنش‌های مالی" },
      { id: "support", icon: "fa-solid fa-headset", title: "پشتیبانی", badge: 5 },
    ],
  },
  {
    label: "تنظیمات",
    items: [
      { id: "categories", icon: "fa-solid fa-tags", title: "دسته‌بندی‌ها" },
      { id: "settings", icon: "fa-solid fa-gear", title: "تنظیمات سیستم" },
    ],
  },
];

// ⚠️ فقط آیتم "tools" در این نسخه واقعاً صفحه دارد. بقیه فعلاً غیرفعال
// (بدون onClick) هستند چون هنوز طراحی/پیاده‌سازی نشده‌اند.
const ENABLED_ITEM_IDS = ["overview", "tools"];

export default function AdminSidebar({ activeItemId, onSelect, pendingToolsCount = 0 }) {
  return (
    <aside className="flex h-screen w-[248px] min-w-[220px] shrink-0 flex-col bg-[#14202B] text-[#C8D2DB]">
      <div className="flex items-center gap-2 px-5 pb-4 pt-5 text-md font-semibold text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600 text-sm text-white">
          <i className="fa-solid fa-screwdriver-wrench" />
        </div>
        هم‌ابزار — مدیریت
      </div>

      <nav className="flex-1 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4 px-3">
            <div className="px-3 py-2 text-[10px] tracking-wide text-[#6B7C8C]">{group.label}</div>
            {group.items.map((item) => {
              const isEnabled = ENABLED_ITEM_IDS.includes(item.id);
              const isActive = item.id === activeItemId;
              const badgeValue = item.id === "tools" ? pendingToolsCount : item.badge;
              return (
                <div
                  key={item.id}
                  onClick={() => isEnabled && onSelect(item.id)}
                  className={`mb-0.5 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : isEnabled
                      ? "cursor-pointer hover:bg-white/[.06] hover:text-white"
                      : "cursor-not-allowed opacity-40"
                  }`}
                >
                  <i className={`w-4 text-center text-[14px] ${item.icon}`} />
                  {item.title}
                  {Boolean(badgeValue) && (
                    <span className="mr-auto rounded-full bg-danger-600 px-1.5 py-px text-[10px] text-white">
                      {badgeValue}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2 border-t border-white/[.08] p-4">
        <Avatar name="مدیر سیستم" size="sm" />
        <div>
          <div className="text-sm text-white">مدیر سیستم</div>
          <div className="text-xs text-[#6B7C8C]">ادمین کل</div>
        </div>
      </div>
    </aside>
  );
}
