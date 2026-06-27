import { toPersianDigits } from "../../utils/format";
import ToolCard from "./ToolCard";
import ToolCardSkeleton from "./ToolCardSkeleton";
import StateMessage from "../common/StateMessage";

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "rating", label: "بهترین امتیاز" },
  { value: "distance", label: "نزدیک‌ترین" },
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
}) {
  return (
    <div className="flex w-full min-w-[340px] flex-col overflow-hidden border-l border-gray-200 bg-gray-50 lg:w-[400px]">
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
        </div>
      </div>

      {/* بدنه اسکرول‌شونده */}
      <div className="thin-scrollbar flex-1 overflow-y-auto p-2 px-3">
        {status === "loading" &&
          Array.from({ length: 4 }).map((_, i) => <ToolCardSkeleton key={i} />)}

        {status === "error" && <StateMessage variant="error" onAction={onRetry} />}

        {status === "success" && tools.length === 0 && (
          <StateMessage variant="noResult" onAction={onResetFilters} />
        )}

        {status === "success" &&
          tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isActive={hoveredToolId === tool.id}
              onHover={onHoverTool}
              onSelect={onSelectTool}
            />
          ))}
      </div>
    </div>
  );
}
