// src/components/tools/ToolListPanel.jsx
import { toPersianDigits } from "../../utils/format";
import ToolCard from "./ToolCard";
import ToolCardSkeleton from "./ToolCardSkeleton";
import StateMessage from "../common/StateMessage";

const SORT_OPTIONS = [
  { value: "newest",    label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "rating",    label: "بهترین امتیاز" },
  { value: "distance",  label: "نزدیک‌ترین" },
];

export default function ToolListPanel({
  tools,
  count,
  status,
  ordering,
  onOrderingChange,
  hoveredToolId,
  onHoverTool,
  onSelectTool,
  onResetFilters,
  onRetry,
  visible,              // موبایل: آیا پنل لیست نمایش داده شود؟
  desktopMapVisible,    // دسکتاپ: الان نقشه نشون داده میشه؟
  onToggleDesktopMap,   // دسکتاپ: toggle نقشه
}) {
  return (
    <div
      className={`
        flex flex-col overflow-hidden border-l border-gray-200 bg-gray-50
        w-full
        ${visible ? "flex" : "hidden"}
        lg:flex
        ${desktopMapVisible ? "lg:w-[400px] lg:min-w-[340px]" : "lg:flex-1"}
      `}
    >
      {/* هدر */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="text-md font-medium text-gray-900">ابزارهای نزدیک شما</div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-500">
            {toPersianDigits(count)} ابزار
          </span>
          <select
            value={ordering}
            onChange={(e) => onOrderingChange(e.target.value)}
            className="cursor-pointer rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-500 outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* دکمه نمایش/پنهان نقشه — فقط دسکتاپ */}
          <button
            onClick={onToggleDesktopMap}
            title={desktopMapVisible ? "پنهان کردن نقشه" : "نمایش نقشه"}
            className="
              hidden lg:flex items-center gap-1.5
              rounded-md border border-gray-200 bg-white px-2 py-1
              text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700
              transition-colors cursor-pointer
            "
          >
            <i className={`fa-solid ${desktopMapVisible ? "fa-map-location-dot" : "fa-map"} text-xs`} />
            <span>{desktopMapVisible ? "پنهان نقشه" : "نمایش نقشه"}</span>
          </button>
        </div>
      </div>

      {/* بدنه اسکرول‌شونده */}
      <div className={`thin-scrollbar flex-1 overflow-y-auto p-3 ${!desktopMapVisible ? "lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:content-start lg:items-start lg:gap-4 lg:p-4" : ""}`}>
        {status === "loading" &&
          Array.from({ length: 4 }).map((_, i) => <ToolCardSkeleton key={i} />)}

        {status === "error" && <StateMessage variant="error" onAction={onRetry} />}

        {status === "success" && tools.length === 0 && (
          <StateMessage variant="noResult" onAction={onResetFilters} />
        )}

        {status === "success" &&
          tools.map((tool) => (
            <div key={tool.id} className="self-start">
              <ToolCard
                tool={tool}
                isActive={hoveredToolId === tool.id}
                onHover={onHoverTool}
                onSelect={onSelectTool}
              />
            </div>
          ))}
      </div>
    </div>
  );
}