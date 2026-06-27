import { Link } from "react-router-dom";
import { formatPriceShort, toPersianDigits } from "../../utils/format";

const STATUS_BADGE = {
  pending: { label: "در انتظار بررسی", className: "bg-warning-50 text-warning-600" },
  approved: { label: "تأیید‌شده", className: "bg-primary-50 text-primary-600" },
  rejected: { label: "رد‌شده", className: "bg-danger-50 text-danger-600" },
};

function formatSubmittedDate(iso) {
  return new Date(iso).toLocaleDateString("fa-IR", { day: "numeric", month: "short" });
}

export default function ToolsManagementTable({ tools, onApprove, onReject, onDelete }) {
  if (tools.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-16 text-center text-gray-400">
        موردی در این بخش وجود ندارد
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-right">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">ابزار</th>
            <th className="px-4 py-3 font-medium">صاحب</th>
            <th className="px-4 py-3 font-medium">قیمت روزانه</th>
            <th className="px-4 py-3 font-medium">تاریخ ثبت</th>
            <th className="px-4 py-3 font-medium">وضعیت</th>
            <th className="px-4 py-3 font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((tool) => {
            const badge = STATUS_BADGE[tool.review_status];
            return (
              <tr key={tool.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                      <i className="fa-solid fa-toolbox text-sm" />
                    </div>
                    <div>
                      <Link to={`/tools/${tool.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                        {tool.name}
                      </Link>
                      <div className="text-xs text-gray-400">{tool.category.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{tool.owner.full_name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatPriceShort(tool.daily_price)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatSubmittedDate(tool.submitted_at)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {tool.review_status === "pending" && (
                      <>
                        <button
                          onClick={() => onApprove(tool)}
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-600 transition hover:bg-primary-100"
                          title="تأیید"
                        >
                          <i className="fa-solid fa-check" />
                        </button>
                        <button
                          onClick={() => onReject(tool)}
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-600 transition hover:bg-[#FCDDD8]"
                          title="رد"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDelete(tool)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-danger-600"
                      title="حذف"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
