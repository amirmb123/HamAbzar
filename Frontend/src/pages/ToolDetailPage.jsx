import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToolDetail } from "../hooks/useToolDetail";

import DetailHeader from "../components/layout/DetailHeader";
import GalleryViewer from "../components/tools/GalleryViewer";
import ToolInfoSection from "../components/tools/ToolInfoSection";
import OwnerCard from "../components/tools/OwnerCard";
import AvailabilityCalendar from "../components/tools/AvailabilityCalendar";
import ReservationCard from "../components/tools/ReservationCard";
import ReviewsSection from "../components/tools/ReviewsSection";
import RelatedTools from "../components/tools/RelatedTools";
import StateMessage from "../components/common/StateMessage";

export default function ToolDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tool, toolStatus, bookedDates, reviewsData, reviewsStatus, relatedTools, relatedStatus } =
    useToolDetail(id);

  const [range, setRange] = useState({ start: null, end: null });

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

      <div className="flex items-start gap-0 px-6 pb-6">
        {/* ستون اصلی */}
        <div className="min-w-0 flex-1 pl-6 pt-5">
          <ToolInfoSection tool={tool} reviewsCount={reviewsData?.total_count} />

          <h2 className="mb-2.5 mt-5 text-lg font-medium text-gray-900">صاحب ابزار</h2>
          <OwnerCard owner={tool.owner} onChatClick={() => navigate("/chat")} />

          <h2 className="mb-2.5 mt-5 text-lg font-medium text-gray-900">تقویم دسترسی</h2>
          <AvailabilityCalendar bookedDates={bookedDates} range={range} onRangeChange={setRange} />

          <ReviewsSection reviewsData={reviewsData} status={reviewsStatus} />

          <RelatedTools tools={relatedTools} status={relatedStatus} />
        </div>

        {/* ستون کناری (رزرو) */}
        <div className="w-[300px] min-w-[260px] shrink-0 pt-5">
          <ReservationCard tool={tool} range={range} onReserve={handleReserve} />
        </div>
      </div>
    </div>
  );
}
