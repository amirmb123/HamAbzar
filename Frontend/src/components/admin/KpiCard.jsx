import { toPersianDigits } from "../../utils/format";

export default function KpiCard({ icon, iconClassName, value, label, trendPercent, trendDirection }) {
  const isUp = trendDirection === "up";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-[38px] w-[38px] items-center justify-center rounded-md text-base ${iconClassName}`}>
          <i className={icon} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? "text-primary-600" : "text-danger-600"}`}>
          <i className={isUp ? "fa-solid fa-arrow-trend-up" : "fa-solid fa-arrow-trend-down"} />
          {toPersianDigits(trendPercent)}٪
        </div>
      </div>
      <div className="text-[26px] font-bold text-gray-900">{toPersianDigits(value.toLocaleString("en-US"))}</div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </div>
  );
}
