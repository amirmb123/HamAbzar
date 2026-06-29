import { formatPrice } from "../../utils/format";
import Badge from "../common/Badge";
import Button from "../common/Button";

/**
 * کارت مدیریتی ابزار — برای صفحه‌ی «ابزارهای من».
 * برخلاف ToolCard (که برای مرور/رزرو طراحی شده)، اینجا اکشن‌های مالکیتی
 * (ویرایش، توقف/فعال‌سازی، حذف) در اختیار صاحب ابزار قرار می‌گیرد.
 */
export default function MyToolCard({ tool, isPending, onToggleAvailability, onEdit, onDelete }) {
  const { name, category, daily_price, deposit_amount, is_available, thumbnail } = tool;

  return (
    <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4">
      {/* تصویر */}
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
        {thumbnail ? (
          <img src={thumbnail} alt={name} className="h-full w-full object-cover" />
        ) : (
          <i className="fa-solid fa-toolbox text-2xl text-gray-300" />
        )}
      </div>

      {/* اطلاعات */}
      <div className="flex-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <span className="text-base font-medium text-gray-900">{name}</span>
          {is_available ? (
            <Badge variant="green" icon="fa-solid fa-circle text-[6px]">
              فعال
            </Badge>
          ) : (
            <Badge variant="gray" icon="fa-solid fa-circle text-[6px]">
              متوقف‌شده
            </Badge>
          )}
        </div>

        <div className="mb-2 text-xs text-gray-500">{category?.name}</div>

        <div className="mb-3 text-sm text-gray-900">
          {formatPrice(daily_price)} <span className="text-xs text-gray-500">/ روز</span>
          {deposit_amount > 0 && (
            <span className="mr-3 text-xs text-gray-500">ودیعه: {formatPrice(deposit_amount)}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" icon="fa-solid fa-pen" onClick={() => onEdit(tool)}>
            ویرایش
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={is_available ? "fa-solid fa-pause" : "fa-solid fa-play"}
            disabled={isPending}
            onClick={() => onToggleAvailability(tool)}
          >
            {is_available ? "توقف آگهی" : "فعال‌سازی آگهی"}
          </Button>
          <Button
            variant="dangerOutline"
            size="sm"
            icon="fa-solid fa-trash"
            disabled={isPending}
            onClick={() => onDelete(tool)}
          >
            حذف
          </Button>
        </div>
      </div>
    </div>
  );
}
