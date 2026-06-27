import { WEEKDAY_LABELS, formatJalaliMonthLabel, jalaliToIsoString } from "../../utils/jalali";
import { buildMonthCells } from "../../utils/calendarLogic";

/**
 * یک بلوک ماه تک، برای استفاده در نمایش دوماهه‌ی فلوی checkout.
 * showPrevNav/showNextNav کنترل می‌کنن کدوم فلش (راست/چپ) نشون داده شه —
 * در طراحی، فلش قبلی فقط روی ماه اول و فلش بعدی فقط روی ماه دوم هست.
 */
export default function CalendarMonthBlock({
  jy,
  jm,
  today,
  getDayState,
  onDayClick,
  showPrevNav,
  showNextNav,
  onPrevMonth,
  onNextMonth,
}) {
  const cells = buildMonthCells(jy, jm);

  return (
    <div className="flex-1 p-4">
      <div className="mb-3 flex items-center justify-between">
        {showPrevNav ? (
          <button
            onClick={onPrevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-[13px] text-gray-500"
            aria-label="ماه قبل"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        ) : (
          <span className="w-7" />
        )}

        <span className="text-md font-semibold text-gray-900">{formatJalaliMonthLabel(jy, jm)}</span>

        {showNextNav ? (
          <button
            onClick={onNextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-[13px] text-gray-500"
            aria-label="ماه بعد"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
        ) : (
          <span className="w-7" />
        )}
      </div>

      <div className="grid grid-cols-7 gap-[3px]">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1.5 text-center text-[10px] text-gray-400">
            {label}
          </div>
        ))}

        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="pointer-events-none aspect-square" />;

          const iso = jalaliToIsoString(jy, jm, day);
          const { isBooked, isSelectedEdge, isInRange } = getDayState(iso);
          const isToday = jy === today.jy && jm === today.jm && day === today.jd;

          let dayClass = "text-gray-900 hover:bg-gray-100";
          if (isBooked) {
            dayClass = "bg-danger-50 text-danger-600 line-through cursor-not-allowed opacity-70 text-[11px]";
          } else if (isSelectedEdge) {
            dayClass = "bg-primary-600 text-white font-semibold";
          } else if (isInRange) {
            dayClass = "bg-primary-50 text-primary-700";
          }

          return (
            <button
              key={iso}
              disabled={isBooked}
              onClick={() => onDayClick(iso)}
              className={`flex aspect-square items-center justify-center rounded-md text-xs transition ${dayClass} ${
                isToday && !isSelectedEdge ? "border-[1.5px] border-primary-600 font-bold" : ""
              }`}
            >
              {new Intl.NumberFormat("fa-IR").format(day)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
