import { useState } from "react";
import { formatPrice, toPersianDigits } from "../../utils/format";
import { toJalali, formatJalaliMonthLabel } from "../../utils/jalali";
import { TIME_SLOTS } from "./TimeSlotPicker";
import { DELIVERY_METHODS } from "./DeliveryOptions";
import Button from "../common/Button";

function formatShortJalaliDate(iso) {
  if (!iso) return "—";
  const { jy, jm, jd } = toJalali(iso);
  const monthLabel = formatJalaliMonthLabel(jy, jm).split(" ")[0];
  return `${toPersianDigits(jd)} ${monthLabel}`;
}

function diffDays(startIso, endIso) {
  return Math.round((new Date(endIso) - new Date(startIso)) / (1000 * 60 * 60 * 24));
}

const PLATFORM_FEE_RATE = 0.1;

export default function CheckoutSummarySidebar({ tool, range, timeSlotId, deliveryMethodId, onContinue }) {
  const [promoCode, setPromoCode] = useState("");

  const days = range.start && range.end ? diffDays(range.start, range.end) : 0;
  const hasValidRange = days > 0;

  const timeSlot = TIME_SLOTS.find((s) => s.id === timeSlotId);
  const deliveryMethod = DELIVERY_METHODS.find((m) => m.id === deliveryMethodId) || DELIVERY_METHODS[0];

  const subtotal = days * tool.daily_price;
  const deliveryFee = deliveryMethod.price;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const total = subtotal + deliveryFee + platformFee + tool.deposit_amount;

  return (
    <div className="sticky top-[88px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
      <div className="border-b border-gray-100 px-5 py-4 text-md font-semibold text-gray-900">
        خلاصه رزرو
      </div>

      <div className="px-5 py-5">
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-gray-500">تاریخ تحویل</span>
          <span className="font-medium text-gray-900">
            {formatShortJalaliDate(range.start)}
            {timeSlot ? `، ساعت ${timeSlot.time}` : ""}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-gray-500">تاریخ بازگشت</span>
          <span className="font-medium text-gray-900">
            {formatShortJalaliDate(range.end)}
            {timeSlot ? `، ساعت ${timeSlot.time}` : ""}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-gray-500">مدت اجاره</span>
          <span className="font-medium text-gray-900">{toPersianDigits(days)} روز</span>
        </div>

        <div className="my-3 h-px bg-gray-100" />

        {hasValidRange ? (
          <>
            <div className="flex items-center justify-between py-2 text-base text-gray-500">
              <span>
                {formatPrice(tool.daily_price)} × {toPersianDigits(days)} روز
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-base text-gray-500">
              <span>هزینه {deliveryMethod.title}</span>
              <span>{deliveryFee === 0 ? "رایگان" : formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-base text-gray-500">
              <span>کارمزد پلتفرم</span>
              <span>{formatPrice(platformFee)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-base text-gray-500">
              <span>ودیعه (بازگشتی)</span>
              <span>{formatPrice(tool.deposit_amount)}</span>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                type="text"
                placeholder="کد تخفیف"
                className="flex-1 rounded-md border border-gray-200 px-3.5 py-2 text-base outline-none focus:border-primary-600"
              />
              <Button variant="outline" size="sm">
                اعمال
              </Button>
            </div>

            <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-3 text-md font-semibold text-gray-900">
              <span>جمع پرداختی</span>
              <span>{formatPrice(total)}</span>
            </div>
          </>
        ) : (
          <p className="py-3 text-sm text-gray-500">برای مشاهده مبلغ، بازه‌ی اجاره را از تقویم انتخاب کنید.</p>
        )}

        <Button
          full
          size="lg"
          disabled={!hasValidRange}
          onClick={onContinue}
          className="mt-4 rounded-lg"
        >
          ادامه به پرداخت
          <i className="fa-solid fa-arrow-left" />
        </Button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
          <i className="fa-solid fa-shield-halved text-primary-600" />
          پرداخت امن · بازگشت ودیعه تضمین‌شده
        </div>
      </div>
    </div>
  );
}
