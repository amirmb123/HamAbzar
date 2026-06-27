import { WEEKDAY_LABELS, formatJalaliMonthLabel, jalaliToIsoString } from "../../utils/jalali";
import { useDateRangeCalendar, buildMonthCells } from "../../utils/calendarLogic";

/**
 * تقویم دسترسی ابزار (تک‌ماهه) — استفاده‌شده در صفحه‌ی جزئیات ابزار.
 * منطق هسته‌ای مشترک با نسخه‌ی دوماهه‌ی فلوی checkout در
 * src/utils/calendarLogic.js قرار دارد تا رفتار انتخاب بازه و
 * تشخیص روزهای رزرو‌شده در هر دو جا یکسان باشد.
 */
export default function AvailabilityCalendar({ bookedDates = [], range, onRangeChange }) {
  const { today, viewYear, viewMonth, goToPrevMonth, goToNextMonth, handleDayClick, getDayState } =
    useDateRangeCalendar(bookedDates, range, onRangeChange);

  const cells = buildMonthCells(viewYear, viewMonth);

  return (
    <div className="rounded-lg bg-gray-50 p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-[15px] text-gray-500"
          aria-label="ماه قبل"
        >
          <i className="fa-solid fa-chevron-right" />
        </button>
        <div className="text-md font-medium text-gray-900">
          {formatJalaliMonthLabel(viewYear, viewMonth)}
        </div>
        <button
          onClick={goToNextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-[15px] text-gray-500"
          aria-label="ماه بعد"
        >
          <i className="fa-solid fa-chevron-left" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-[3px]">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-[10px] text-gray-500">
            {label}
          </div>
        ))}

        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;

          const iso = jalaliToIsoString(viewYear, viewMonth, day);
          const { isBooked, isSelectedEdge, isInRange } = getDayState(iso);
          const isToday = viewYear === today.jy && viewMonth === today.jm && day === today.jd;

          let dayClass = "text-gray-900 hover:bg-white";
          if (isBooked) {
            dayClass = "bg-danger-50 text-danger-600 line-through cursor-not-allowed text-[11px]";
          } else if (isSelectedEdge) {
            dayClass = "bg-primary-600 text-white font-medium";
          } else if (isInRange) {
            dayClass = "bg-primary-50 text-primary-600";
          }

          return (
            <button
              key={iso}
              disabled={isBooked}
              onClick={() => handleDayClick(iso)}
              className={`flex aspect-square items-center justify-center rounded-md text-xs transition ${dayClass} ${
                isToday && !isSelectedEdge ? "border-[1.5px] border-primary-600" : ""
              }`}
            >
              {new Intl.NumberFormat("fa-IR").format(day)}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <div className="h-2.5 w-2.5 rounded-[3px] bg-primary-600" /> انتخاب‌شده
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <div className="h-2.5 w-2.5 rounded-[3px] border border-primary-600 bg-primary-50" /> بازه
          اجاره
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <div className="h-2.5 w-2.5 rounded-[3px] bg-danger-50" /> رزرو شده
        </div>
      </div>
    </div>
  );
}
