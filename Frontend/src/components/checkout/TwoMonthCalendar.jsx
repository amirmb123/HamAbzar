import { useDateRangeCalendar } from "../../utils/calendarLogic";
import { shiftMonth } from "../../utils/calendarLogic";
import CalendarMonthBlock from "./CalendarMonthBlock";

const LEGEND_ITEMS = [
  { swatchClass: "bg-primary-600", label: "تاریخ انتخاب‌شده" },
  { swatchClass: "border border-primary-100 bg-primary-50", label: "بازه اجاره" },
  { swatchClass: "bg-danger-50", label: "رزرو شده" },
  { swatchClass: "border-[1.5px] border-primary-600", label: "امروز" },
];

/** تقویم دوماهه‌ی فلوی checkout — ماه اول و ماه بعدش کنار هم نشون داده می‌شن */
export default function TwoMonthCalendar({ bookedDates = [], range, onRangeChange }) {
  const { today, viewYear, viewMonth, goToPrevMonth, goToNextMonth, handleDayClick, getDayState } =
    useDateRangeCalendar(bookedDates, range, onRangeChange);

  const secondMonth = shiftMonth(viewYear, viewMonth, 1);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-col md:flex-row">
        <div className="border-b border-gray-100 md:border-b-0 md:border-l">
          <CalendarMonthBlock
            jy={viewYear}
            jm={viewMonth}
            today={today}
            getDayState={getDayState}
            onDayClick={handleDayClick}
            showPrevNav
            showNextNav={false}
            onPrevMonth={goToPrevMonth}
          />
        </div>
        <div>
          <CalendarMonthBlock
            jy={secondMonth.jy}
            jm={secondMonth.jm}
            today={today}
            getDayState={getDayState}
            onDayClick={handleDayClick}
            showPrevNav={false}
            showNextNav
            onNextMonth={goToNextMonth}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 border-t border-gray-100 bg-gray-50 px-4 py-3">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className={`h-[11px] w-[11px] rounded-[3px] ${item.swatchClass}`} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
