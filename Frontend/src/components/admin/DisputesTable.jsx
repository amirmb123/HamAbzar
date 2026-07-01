import { formatPrice, toPersianDigits } from "../../utils/format";

const STATUS_BADGE = {
  open: { label: "باز", className: "bg-warning-50 text-warning-600" },
  under_review: { label: "در حال بررسی", className: "bg-info-50 text-info-600" },
  resolved: { label: "حل‌شده", className: "bg-primary-50 text-primary-600" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fa-IR", { day: "numeric", month: "short", year: "numeric" });
}

export default function DisputesTable({ disputes, onResolve }) {
  if (disputes.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-16 text-center text-gray-400">
        موردی در این بخش وجود ندارد
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[760px] text-right">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">رزرو</th>
            <th className="px-4 py-3 font-medium">شاکی</th>
            <th className="px-4 py-3 font-medium">دلیل شکایت</th>
            <th className="px-4 py-3 font-medium">تاریخ ثبت</th>
            <th className="px-4 py-3 font-medium">وضعیت</th>
            <th className="px-4 py-3 font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {disputes.map((dispute) => {
            const badge = STATUS_BADGE[dispute.status] || STATUS_BADGE.open;
            const isResolved = dispute.status === "resolved";
            return (
              <tr key={dispute.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  #{toPersianDigits(dispute.rental_id)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div>{dispute.raised_by.full_name}</div>
                  <div className="text-xs text-gray-400" dir="ltr">{dispute.raised_by.phone}</div>
                </td>
                <td className="max-w-[280px] px-4 py-3 text-sm text-gray-700">
                  <p className="line-clamp-2 break-words">{dispute.reason}</p>
                  {isResolved && (
                    <p className="mt-1 line-clamp-2 break-words text-xs text-gray-400">
                      نتیجه: {dispute.resolution}
                    </p>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                  {formatDate(dispute.created_at)}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                  {isResolved && dispute.penalty_amount > 0 && (
                    <div className="mt-1 whitespace-nowrap text-xs text-gray-500">
                      جریمه: {formatPrice(dispute.penalty_amount)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isResolved ? (
                    <span className="text-xs text-gray-400">رسیدگی شده</span>
                  ) : (
                    <button
                      onClick={() => onResolve(dispute)}
                      className="flex items-center gap-1.5 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 transition hover:bg-primary-100"
                    >
                      <i className="fa-solid fa-gavel" />
                      رسیدگی
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
