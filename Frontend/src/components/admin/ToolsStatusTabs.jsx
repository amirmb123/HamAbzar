import { toPersianDigits } from "../../utils/format";

const TABS = [
  { value: "all", label: "همه" },
  { value: "pending", label: "در انتظار بررسی" },
  { value: "approved", label: "تأیید‌شده" },
  { value: "rejected", label: "رد‌شده" },
];

export default function ToolsStatusTabs({ activeTab, onChange, counts }) {
  return (
    <div className="mb-4 flex gap-1 border-b border-gray-200">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            activeTab === tab.value
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          {tab.label}
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs ${
              activeTab === tab.value ? "bg-primary-50 text-primary-600" : "bg-gray-100 text-gray-500"
            }`}
          >
            {toPersianDigits(counts[tab.value] ?? 0)}
          </span>
        </button>
      ))}
    </div>
  );
}
