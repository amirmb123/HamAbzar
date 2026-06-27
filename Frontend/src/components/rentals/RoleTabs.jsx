import { toPersianDigits } from "../../utils/format";

export default function RoleTabs({ activeRole, onChange, borrowedCount, lentCount }) {
  return (
    <div className="mb-5 flex gap-2 border-b border-gray-200">
      <button
        onClick={() => onChange("borrowed")}
        className={`flex items-center gap-1.5 border-b-[2.5px] px-2 py-3 text-base font-medium transition ${
          activeRole === "borrowed"
            ? "border-primary-600 text-primary-600"
            : "border-transparent text-gray-500 hover:text-gray-900"
        }`}
      >
        <i className="fa-solid fa-bag-shopping" />
        اجاره‌هایی که گرفته‌ام
        <span
          className={`rounded-full px-1.5 py-0.5 text-xs ${
            activeRole === "borrowed" ? "bg-primary-50 text-primary-600" : "bg-gray-100 text-gray-500"
          }`}
        >
          {toPersianDigits(borrowedCount)}
        </span>
      </button>

      <button
        onClick={() => onChange("lent")}
        className={`flex items-center gap-1.5 border-b-[2.5px] px-2 py-3 text-base font-medium transition ${
          activeRole === "lent"
            ? "border-primary-600 text-primary-600"
            : "border-transparent text-gray-500 hover:text-gray-900"
        }`}
      >
        <i className="fa-solid fa-handshake" />
        اجاره‌هایی که داده‌ام
        <span
          className={`rounded-full px-1.5 py-0.5 text-xs ${
            activeRole === "lent" ? "bg-primary-50 text-primary-600" : "bg-gray-100 text-gray-500"
          }`}
        >
          {toPersianDigits(lentCount)}
        </span>
      </button>
    </div>
  );
}
