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

export default function CheckoutPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // اگر از صفحه‌ی جزئیات ابزار با بازه‌ی تاریخ از‌پیش‌انتخاب‌شده اومده باشیم
  const initialRange = location.state?.range || { start: null, end: null };

  const { tool, toolStatus, bookedDates } = useToolDetail(id);
  const { currentStep, range, setRange, timeSlotId, setTimeSlotId, deliveryMethodId, setDeliveryMethodId, goToPaymentStep } =
    useCheckoutFlow(initialRange);

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
            <TwoMonthCalendar bookedDates={bookedDates} range={range} onRangeChange={setRange} />
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
              ownerAddress={tool.address}
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
            onContinue={goToPaymentStep}
          />
        </div>
      </div>
    </div>
  );
}
