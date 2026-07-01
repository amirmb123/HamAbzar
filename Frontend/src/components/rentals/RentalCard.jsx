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
function RentalActions({ rental, role, onCancel, onConfirm, onHandover, onMarkReturned, onDispute }) {
  const { status } = rental;

  if (status === "pending" && role === "borrowed") {
    return (
      <>
        <Button variant="ghost" size="sm" onClick={() => onCancel?.(rental)}>
          لغو درخواست
        </Button>
        <Link to={`/rentals/${rental.id}/chat`}>
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
        <Button variant="outline" size="sm" onClick={() => onCancel?.(rental)}>
          رد درخواست
        </Button>
        <Link to={`/rentals/${rental.id}/chat`}>
          <Button variant="outline" size="sm">
            چت با اجاره‌گیرنده
          </Button>
        </Link>
        <Button size="sm" onClick={() => onConfirm?.(rental)}>
          تأیید رزرو
        </Button>
      </>
    );
  }

  if (status === "confirmed" && role === "lent") {
    return (
      <>
        <Link to={`/rentals/${rental.id}/chat`}>
          <Button variant="outline" size="sm">
            چت با اجاره‌گیرنده
          </Button>
        </Link>
        <Button size="sm" onClick={() => onHandover?.(rental)}>
          ثبت تحویل ابزار
        </Button>
      </>
    );
  }

  if (status === "confirmed") {
    return (
      <Link to={`/rentals/${rental.id}/chat`}>
        <Button size="sm">چت با صاحب</Button>
      </Link>
    );
  }

  if (status === "active" && role === "lent") {
    return (
      <>
        <Button variant="ghost" size="sm" icon="fa-solid fa-flag" onClick={() => onDispute?.(rental)}>
          ثبت شکایت
        </Button>
        <Link to={`/rentals/${rental.id}/chat`}>
          <Button variant="outline" size="sm">
            چت با اجاره‌گیرنده
          </Button>
        </Link>
        <Button size="sm" onClick={() => onMarkReturned?.(rental)}>
          ثبت بازگشت ابزار
        </Button>
      </>
    );
  }

  if (status === "active") {
    return (
      <>
        <Button variant="ghost" size="sm" icon="fa-solid fa-flag" onClick={() => onDispute?.(rental)}>
          ثبت شکایت
        </Button>
        <Link to={`/rentals/${rental.id}/chat`}>
          <Button size="sm">چت با صاحب</Button>
        </Link>
      </>
    );
  }

  if (status === "returned") {
    return (
      <>
        <Button variant="ghost" size="sm" icon="fa-solid fa-flag" onClick={() => onDispute?.(rental)}>
          ثبت شکایت
        </Button>
        <Link to={`/rentals/${rental.id}/review`}>
          <Button variant="outline" size="sm" icon="fa-regular fa-star">
            ثبت امتیاز
          </Button>
        </Link>
        {role === "borrowed" && (
          <Link to={`/tools/${rental.tool.id}`}>
            <Button variant="ghost" size="sm">
              اجاره مجدد
            </Button>
          </Link>
        )}
      </>
    );
  }

  if (status === "disputed") {
    return (
      <Button variant="ghost" size="sm">
        جزئیات شکایت
      </Button>
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

export default function RentalCard({ rental, role, onCancel, onConfirm, onHandover, onMarkReturned, onDispute }) {
  const { tool, borrower, status, total_price } = rental;
  // در پاسخ فعلی بک‌اند، owner فقط در جزئیات رزرو (نه در لیست) برمی‌گردد؛
  // فعلاً برای نمایش طرف مقابل از borrower استفاده می‌کنیم و در نمای "گرفته‌ام"
  // (role=borrowed) چیزی نشان نمی‌دهیم تا داده‌ی نادرست نمایش داده نشود.
  const counterparty = role === "lent" ? borrower : null;
  const counterpartyLabel = "اجاره‌گیرنده";

  const isCancelled = status === "cancelled";

  return (
    <div
      className={`mb-3 flex flex-wrap items-center gap-4 rounded-lg border p-4 sm:flex-nowrap border-gray-200 bg-white ${
        isCancelled ? "opacity-65" : ""
      }`}
    >
      <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-md bg-primary-50 text-[28px] text-primary-600">
        <i className="fa-solid fa-toolbox opacity-70" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <div>
            <div className="text-md font-semibold text-gray-900">{tool.name}</div>
            <div className="mt-0.5 text-xs text-gray-400">کد رزرو: #{rental.id}</div>
          </div>
          <RentalStatusBadge status={status} />
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <i className="fa-regular fa-calendar" />
            {formatDateRange(rental.start_date, rental.end_date)}
          </div>
          {isCancelled && (
            <div className="text-xs text-gray-500">رزرو لغو شده است</div>
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
            isCancelled ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {formatPriceShort(total_price)}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <RentalActions
            rental={rental}
            role={role}
            onCancel={onCancel}
            onConfirm={onConfirm}
            onHandover={onHandover}
            onMarkReturned={onMarkReturned}
            onDispute={onDispute}
          />
        </div>
      </div>
    </div>
  );
}