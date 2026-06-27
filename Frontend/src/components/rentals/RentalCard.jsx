import { Link } from "react-router-dom";
import Button from "../common/Button";
import Avatar from "../common/Avatar";
import RentalStatusBadge from "./RentalStatusBadge";
import MiniProgress from "./MiniProgress";
import { formatPriceShort, toPersianDigits } from "../../utils/format";
import { toJalali, formatJalaliMonthLabel } from "../../utils/jalali";

function formatShortJalaliDate(iso) {
  const { jy, jm, jd } = toJalali(iso);
  const monthLabel = formatJalaliMonthLabel(jy, jm).split(" ")[0];
  const yearLabel = formatJalaliMonthLabel(jy, jm).split(" ")[1];
  return { day: toPersianDigits(jd), month: monthLabel, year: yearLabel };
}

/** بازه‌ی تاریخ به فرمت «۱۰ تا ۱۳ دی ۱۴۰۳» یا فقط یک تاریخ اگر شروع/پایان یکی باشند */
function formatDateRange(startIso, endIso) {
  const start = formatShortJalaliDate(startIso);
  const end = formatShortJalaliDate(endIso);
  if (startIso === endIso) return `${start.day} ${start.month} ${start.year}`;
  if (start.month === end.month) return `${start.day} تا ${end.day} ${end.month} ${end.year}`;
  return `${start.day} ${start.month} تا ${end.day} ${end.month} ${end.year}`;
}

/** اکشن‌های متفاوت بر اساس وضعیت رزرو و نقش کاربر (گرفته/داده) */
function RentalActions({ rental, role, onCancel, onMarkReturned, onPayPenalty }) {
  const { status } = rental;

  if (status === "pending" && role === "borrowed") {
    return (
      <>
        <Button variant="ghost" size="sm" onClick={() => onCancel?.(rental)}>
          لغو درخواست
        </Button>
        <Link to="/chat">
          <Button variant="outline" size="sm">
            چت با صاحب
          </Button>
        </Link>
      </>
    );
  }

  if (status === "pending" && role === "lent") {
    return (
      <>
        <Button variant="outline" size="sm">
          رد درخواست
        </Button>
        <Button size="sm">تأیید رزرو</Button>
      </>
    );
  }

  if (status === "active" && role === "lent") {
    return (
      <Button size="sm" onClick={() => onMarkReturned?.(rental)}>
        ثبت بازگشت ابزار
      </Button>
    );
  }

  if (status === "active") {
    return (
      <Link to="/chat">
        <Button size="sm">چت با صاحب</Button>
      </Link>
    );
  }

  if (status === "overdue") {
    return (
      <Button variant="danger" size="sm" onClick={() => onPayPenalty?.(rental)}>
        پرداخت جریمه
      </Button>
    );
  }

  if (status === "returned") {
    return (
      <>
        {!rental.has_review && role === "borrowed" && (
          <Link to={`/rentals/${rental.id}/review`}>
            <Button variant="outline" size="sm" icon="fa-regular fa-star">
              ثبت امتیاز
            </Button>
          </Link>
        )}
        <Link to={`/tools/${rental.tool.id}`}>
          <Button variant="ghost" size="sm">
            اجاره مجدد
          </Button>
        </Link>
      </>
    );
  }

  if (status === "cancelled") {
    return (
      <Button variant="ghost" size="sm">
        جزئیات بازپرداخت
      </Button>
    );
  }

  return null;
}

export default function RentalCard({ rental, role, onCancel, onMarkReturned, onPayPenalty }) {
  const { tool, owner, borrower, status, total_price, booking_code } = rental;
  const counterparty = role === "borrowed" ? owner : borrower;
  const counterpartyLabel = role === "borrowed" ? "صاحب ابزار" : "اجاره‌گیرنده";

  const isCancelled = status === "cancelled";
  const isOverdue = status === "overdue";

  return (
    <div
      className={`mb-3 flex flex-wrap items-center gap-4 rounded-lg border p-4 sm:flex-nowrap ${
        isOverdue ? "border-danger-50 bg-[#FFFBFA]" : "border-gray-200 bg-white"
      } ${isCancelled ? "opacity-65" : ""}`}
    >
      <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-md bg-primary-50 text-[28px] text-primary-600">
        <i className="fa-solid fa-toolbox opacity-70" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <div>
            <div className="text-md font-semibold text-gray-900">{tool.name}</div>
            <div className="mt-0.5 text-xs text-gray-400">کد رزرو: #{booking_code}</div>
          </div>
          <RentalStatusBadge status={status} />
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <i className="fa-regular fa-calendar" />
            {formatDateRange(rental.start_date, rental.end_date)}
            {isOverdue && ` — ${toPersianDigits(rental.overdue_days)} روز تأخیر`}
          </div>
          {tool.address && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <i className="fa-solid fa-location-dot" />
              {tool.address}
            </div>
          )}
          {isCancelled && (
            <div className="text-xs text-gray-500">
              لغو شده توسط {rental.cancelled_by === "owner" ? "صاحب ابزار" : "اجاره‌گیرنده"}
            </div>
          )}
        </div>

        {counterparty && !isCancelled && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Avatar name={counterparty.full_name} size="sm" />
            {counterpartyLabel}: {counterparty.full_name}
          </div>
        )}

        {status === "active" && (
          <MiniProgress
            deliveredLabel="تحویل گرفته شد"
            returnLabel={`بازگشت تا ${formatShortJalaliDate(rental.end_date).day} ${
              formatShortJalaliDate(rental.end_date).month
            }`}
          />
        )}
      </div>

      <div className="flex w-full min-w-[130px] flex-col items-end gap-2 sm:w-auto">
        <div
          className={`text-lg font-semibold ${
            isOverdue ? "text-danger-600" : isCancelled ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {formatPriceShort(total_price)}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <RentalActions
            rental={rental}
            role={role}
            onCancel={onCancel}
            onMarkReturned={onMarkReturned}
            onPayPenalty={onPayPenalty}
          />
        </div>
      </div>
    </div>
  );
}
