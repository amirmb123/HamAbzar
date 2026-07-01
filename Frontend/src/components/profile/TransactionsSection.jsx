// src/components/profile/TransactionsSection.jsx
//
// تاریخچه‌ی تراکنش‌های مالی کاربر — بخش کیف پول در صفحه پروفایل.
// هر ردیف: آیکون جهت‌دار (واریز/برداشت)، نوع تراکنش، تاریخ، و مبلغ با رنگ و علامت.

import { useMyTransactions } from "../../hooks/useMyTransactions";
import { formatPrice, formatDateTime } from "../../utils/format";
import StateMessage from "../common/StateMessage";

const TYPE_ICONS = {
  rental_payment:  "fa-solid fa-cart-shopping",
  deposit_hold:    "fa-solid fa-lock",
  deposit_return:  "fa-solid fa-lock-open",
  deposit_penalty: "fa-solid fa-triangle-exclamation",
};

function TransactionRow({ tx }) {
  const isCredit = tx.direction === "credit";
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 py-3.5 last:border-b-0">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm ${
          isCredit ? "bg-primary-50 text-primary-600" : "bg-danger-50 text-danger-600"
        }`}
      >
        <i className={TYPE_ICONS[tx.type] || "fa-solid fa-wallet"} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-gray-900">{tx.type_display}</div>
        <div className="mt-0.5 truncate text-xs text-gray-500">
          {tx.tool_name ? tx.tool_name : tx.note || "—"}
          {" · "}
          {formatDateTime(tx.created_at)}
        </div>
      </div>

      <div
        className={`shrink-0 text-sm font-semibold ${isCredit ? "text-primary-600" : "text-danger-600"}`}
        dir="ltr"
      >
        {isCredit ? "+" : "−"} {formatPrice(tx.amount)}
      </div>
    </div>
  );
}

function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 py-3.5 last:border-b-0">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-28 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

export default function TransactionsSection() {
  const {
    items,
    status,
    hasMore,
    isLoadingMore,
    loadMore,
    typeFilter,
    setTypeFilter,
    typeOptions,
    refetch,
  } = useMyTransactions();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900">تراکنش‌های مالی</h2>

        {/* فیلتر نوع تراکنش */}
        <div className="flex flex-wrap gap-1.5">
          {typeOptions.map((opt) => (
            <button
              key={opt.value ?? "all"}
              onClick={() => setTypeFilter(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                typeFilter === opt.value
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {status === "loading" && (
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <TransactionRowSkeleton key={i} />
          ))}
        </div>
      )}

      {status === "error" && <StateMessage variant="error" onAction={refetch} />}

      {status === "success" && items.length === 0 && (
        <StateMessage variant="emptyTransactions" />
      )}

      {status === "success" && items.length > 0 && (
        <>
          <div>
            {items.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                {isLoadingMore ? "در حال بارگذاری..." : "نمایش بیشتر"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
