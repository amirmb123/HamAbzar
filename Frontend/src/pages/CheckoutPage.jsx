import { useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useToolDetail } from "../hooks/useToolDetail";
import { useCheckoutFlow } from "../hooks/useCheckoutFlow";

import CheckoutStepper from "../components/checkout/CheckoutStepper";
import ToolSummaryCard from "../components/checkout/ToolSummaryCard";
import TwoMonthCalendar from "../components/checkout/TwoMonthCalendar";
import TimeSlotPicker from "../components/checkout/TimeSlotPicker";
import DeliveryOptions from "../components/checkout/DeliveryOptions";
import RentalTermsBox from "../components/checkout/RentalTermsBox";
import CheckoutSummarySidebar from "../components/checkout/CheckoutSummarySidebar";
import StateMessage from "../components/common/StateMessage";
import { jalaliToIsoString } from "../utils/jalali";
import { shiftMonth } from "../utils/calendarLogic";

/** تبدیل ماه شمسی {jy, jm} به رشته‌ی میلادی "YYYY-MM" برای API */
function jalaliMonthToGregorianString(jy, jm) {
  const isoFirstDay = jalaliToIsoString(jy, jm, 1);
  return isoFirstDay.slice(0, 7);
}

export default function CheckoutPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialRange = location.state?.range || { start: null, end: null };

  const { tool, toolStatus, bookedDates, fetchAvailabilityForMonths } = useToolDetail(id);
  const {
    currentStep,
    range,
    setRange,
    timeSlotId,
    setTimeSlotId,
    deliveryMethodId,
    setDeliveryMethodId,
    isSubmitting,
    errorMessage,
    goToPaymentStep,
  } = useCheckoutFlow(id, initialRange);

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

  const handleContinue = async () => {
    const result = await goToPaymentStep();
    if (result.success) {
      navigate("/my-rentals");
    }
  };

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

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-md bg-primary-600 text-white">
            <i className="fa-solid fa-screwdriver-wrench" />
          </div>
          هم‌ابزار
        </div>
        <span className="text-md font-semibold text-gray-900">فرآیند رزرو</span>
        <button
          onClick={() => navigate(`/tools/${id}`)}
          className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          انصراف
          <i className="fa-solid fa-xmark" />
        </button>
      </header>

      <CheckoutStepper currentStep={currentStep} />

      <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-6 p-6 md:grid-cols-[1fr_340px]">
        {/* ستون اصلی */}
        <div>
          <ToolSummaryCard tool={tool} />

          <h2 className="mb-4 flex items-center justify-between text-lg font-semibold text-gray-900">
            انتخاب تاریخ اجاره
          </h2>
          <div className="mb-5">
            <TwoMonthCalendar
              bookedDates={bookedDates}
              range={range}
              onRangeChange={setRange}
              onMonthChange={handleMonthChange}
            />
          </div>

          <h2 className="mb-4 mt-2 text-lg font-semibold text-gray-900">ساعت تحویل</h2>
          <div className="mb-6">
            <TimeSlotPicker selectedSlot={timeSlotId} onSelect={setTimeSlotId} />
          </div>

          <h2 className="mb-4 text-lg font-semibold text-gray-900">روش تحویل ابزار</h2>
          <div className="mb-6">
            <DeliveryOptions
              selectedMethod={deliveryMethodId}
              onSelect={setDeliveryMethodId}
              ownerAddress={tool.city?.name}
            />
          </div>

          <h2 className="mb-4 text-lg font-semibold text-gray-900">قوانین اجاره</h2>
          <RentalTermsBox />
        </div>

        {/* سایدبار خلاصه */}
        <div>
          <CheckoutSummarySidebar
            tool={tool}
            range={range}
            timeSlotId={timeSlotId}
            deliveryMethodId={deliveryMethodId}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </div>
  );
}
