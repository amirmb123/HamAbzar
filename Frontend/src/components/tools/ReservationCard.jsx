import { formatPrice, toPersianDigits } from "../../utils/format";
import { toJalali, formatJalaliMonthLabel } from "../../utils/jalali";

/** فرمت کوتاه تاریخ ISO به شمسی → "۱۰ دی" */
function formatShortJalaliDate(iso) {
  if (!iso) return "—";
  const { jy, jm, jd } = toJalali(iso);
  const monthLabel = formatJalaliMonthLabel(jy, jm).split(" ")[0];
  return `${toPersianDigits(jd)} ${monthLabel}`;
}

function diffDays(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

const PLATFORM_FEE_RATE = 0.1; // ۱۰٪ کارمزد پلتفرم — تا وقتی بک‌اند مقدار واقعی رو برگردونه

export default function ReservationCard({ tool, range, onReserve }) {
  const days = range.start && range.end ? diffDays(range.start, range.end) : 0;
  const subtotal = days * tool.daily_price;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const total = subtotal + platformFee + tool.deposit_amount;

  const hasValidRange = days > 0;

  return (
    <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3.5 flex items-center justify-between text-md font-medium text-gray-900">
        <span>رزرو ابزار</span>
        <span className="text-base font-medium text-primary-600">
          {formatPrice(tool.daily_price)}{" "}
          <span className="text-xs font-normal text-gray-500">ت/روز</span>
        </span>
      </div>

      <div className="mb-3.5 flex gap-2">
        <div className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2.5">
          <div className="mb-0.5 text-[10px] text-gray-500">از تاریخ</div>
          <div className="text-base font-medium text-gray-900">
            {formatShortJalaliDate(range.start)}
          </div>
        </div>
        <div className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2.5">
          <div className="mb-0.5 text-[10px] text-gray-500">تا تاریخ</div>
          <div className="text-base font-medium text-gray-900">
            {formatShortJalaliDate(range.end)}
          </div>
        </div>
      </div>

      {hasValidRange ? (
        <div className="mb-3 border-t border-gray-200 pt-3">
          <div className="mb-2 flex items-center justify-between text-base text-gray-500">
            <span>
              {formatPrice(tool.daily_price)} × {toPersianDigits(days)} روز
            </span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mb-2 flex items-center justify-between text-base text-gray-500">
            <span>کارمزد پلتفرم</span>
            <span>{formatPrice(platformFee)}</span>
          </div>
          <div className="mb-2 flex items-center justify-between text-base text-gray-500">
            <span>ودیعه (بازگشتی)</span>
            <span>{formatPrice(tool.deposit_amount)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-2.5 text-md font-medium text-gray-900">
            <span>جمع پرداختی</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      ) : (
        <p className="mb-3 border-t border-gray-200 pt-3 text-sm text-gray-500">
          برای مشاهده مبلغ، بازه‌ی اجاره را از تقویم انتخاب کنید.
        </p>
      )}

      <button
        disabled={!hasValidRange}
        onClick={() => onReserve?.({ range, total })}
        className={`mb-2 flex w-full items-center justify-center gap-2 rounded-[10px] py-3.5 text-md font-medium text-white transition ${
          hasValidRange ? "bg-primary-600 hover:bg-primary-700" : "cursor-not-allowed bg-gray-200"
        }`}
      >
        <i className="fa-regular fa-calendar-check" />
        رزرو و پرداخت
      </button>

      <button className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-gray-200 py-2.5 text-base text-gray-500 transition hover:bg-gray-50">
        <i className="fa-regular fa-heart" />
        افزودن به علاقه‌مندی‌ها
      </button>

      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-gray-500">
        <i className="fa-solid fa-shield-halved text-[13px] text-primary-600" />
        پرداخت امن · بازگشت ودیعه تضمین‌شده
      </div>
    </div>
  );
}
