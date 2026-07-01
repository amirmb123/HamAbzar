import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToolDetail } from "../hooks/useToolDetail";

import DetailHeader from "../components/layout/DetailHeader";
import GalleryViewer from "../components/tools/GalleryViewer";
import ToolInfoSection from "../components/tools/ToolInfoSection";
import OwnerCard from "../components/tools/OwnerCard";
import AvailabilityCalendar from "../components/tools/AvailabilityCalendar";
import ReservationCard from "../components/tools/ReservationCard";
import ReviewsSection from "../components/tools/ReviewsSection";
import StateMessage from "../components/common/StateMessage";
import { jalaliToIsoString, jalaliMonthLength } from "../utils/jalali";
import { shiftMonth } from "../utils/calendarLogic";

/** تبدیل ماه شمسی {jy, jm} به رشته‌ی میلادی "YYYY-MM" برای API */
function jalaliMonthToGregorianString(jy, jm) {
  // اول روز ماه شمسی را به میلادی تبدیل می‌کنیم
  const isoFirstDay = jalaliToIsoString(jy, jm, 1);
  return isoFirstDay.slice(0, 7); // "YYYY-MM"
}

export default function ToolDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    tool,
    toolStatus,
    bookedDates,
    fetchAvailabilityForMonths,
    reviewsData,
    reviewsStatus,
  } = useToolDetail(id);

  const [range, setRange] = useState({ start: null, end: null });

  // هر بار که کاربر ماه تقویم را عوض کند، availability ماه جدید را fetch می‌کنیم
  const handleMonthChange = useCallback(
    (jy, jm) => {
      const currentMonth = jalaliMonthToGregorianString(jy, jm);
      const next = shiftMonth(jy, jm, 1);
      const nextMonth = jalaliMonthToGregorianString(next.jy, next.jm);
      fetchAvailabilityForMonths(currentMonth, nextMonth);
    },
    [fetchAvailabilityForMonths]
  );

  if (toolStatus === "error") {
    return (
      <div className="flex h-screen items-center justify-center">
        <StateMessage variant="error" />
      </div>
    );
  }

  if (toolStatus === "loading" || !tool) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">در حال بارگذاری...</div>
      </div>
    );
  }

  const handleReserve = ({ range: selectedRange }) => {
    navigate(`/checkout/${tool.id}`, { state: { range: selectedRange } });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      <DetailHeader categoryName={tool.category.name} toolName={tool.name} />

      <GalleryViewer images={tool.images} isVerified={tool.is_verified} />

      <div className="flex flex-col gap-6 px-4 pb-6 sm:px-6 lg:flex-row lg:items-start lg:gap-8">
        {/* ستون اصلی */}
        <div className="min-w-0 flex-1 pt-5">
          <ToolInfoSection tool={tool} reviewsCount={reviewsData?.total_count} />

          <h2 className="mb-2.5 mt-5 text-lg font-medium text-gray-900">صاحب ابزار</h2>
          <OwnerCard owner={tool.owner} />

          <h2 className="mb-2.5 mt-5 text-lg font-medium text-gray-900">تقویم دسترسی</h2>
          <AvailabilityCalendar
            bookedDates={bookedDates}
            range={range}
            onRangeChange={setRange}
            onMonthChange={handleMonthChange}
          />

          <ReviewsSection reviewsData={reviewsData} status={reviewsStatus} />
        </div>

        {/* ستون کناری (رزرو) */}
        <div className="w-full pt-5 lg:w-[300px] lg:min-w-[260px] lg:shrink-0">
          <ReservationCard tool={tool} range={range} onReserve={handleReserve} />
        </div>
      </div>
    </div>
  );
}
