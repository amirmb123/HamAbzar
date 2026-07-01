import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyRentals } from "../hooks/useMyRentals";
import AppHeader from "../components/layout/AppHeader";
import RoleTabs from "../components/rentals/RoleTabs";
import StatusFilterChips from "../components/rentals/StatusFilterChips";
import RentalCard from "../components/rentals/RentalCard";
import ConfirmReturnModal from "../components/rentals/ConfirmReturnModal";
import DisputeFormModal from "../components/rentals/DisputeFormModal";
import StateMessage from "../components/common/StateMessage";

export default function MyRentalsPage() {
  const navigate = useNavigate();
  const {
    role,
    setRole,
    statusFilter,
    setStatusFilter,
    rentals,
    borrowedCount,
    lentCount,
    status,
    refetch,
    actionError,
    confirm,
    handover,
    markReturned,
    cancel,
    fileDispute,
  } = useMyRentals();

  // رزروی که منتظر تایید نهایی صاحب ابزار برای ثبت بازگشت است (یا null)
  const [returnTarget, setReturnTarget] = useState(null);
  // رزروی که در حال ثبت شکایت برای آن هستیم (یا null)
  const [disputeTarget, setDisputeTarget] = useState(null);

  const handleCancel = (rental) => {
    cancel(rental.id);
  };

  const handleConfirm = (rental) => {
    confirm(rental.id);
  };

  const handleHandover = (rental) => {
    handover(rental.id);
  };

  const handleMarkReturned = (rental) => {
    setReturnTarget(rental);
  };

  const confirmReturn = async () => {
    const ok = await markReturned(returnTarget.id);
    if (!ok) throw new Error(actionError || "ثبت بازگشت ناموفق بود.");
    setReturnTarget(null);
  };

  const handleOpenDispute = (rental) => {
    setDisputeTarget(rental);
  };

  const confirmDispute = async (reason) => {
    await fileDispute(disputeTarget.id, reason);
    setDisputeTarget(null);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      <AppHeader activePath="/my-rentals" />

      <div className="mx-auto max-w-[1040px] p-6">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">کرایه‌های من</h1>
        <p className="mb-6 text-base text-gray-500">مدیریت اجاره‌های انجام‌شده و درخواست‌های در انتظار</p>

        <RoleTabs
          activeRole={role}
          onChange={setRole}
          borrowedCount={borrowedCount}
          lentCount={lentCount}
        />

        <StatusFilterChips activeFilter={statusFilter} onChange={setStatusFilter} />

        {status === "loading" && (
          <div className="py-12 text-center text-gray-500">در حال بارگذاری...</div>
        )}

        {status === "error" && <StateMessage variant="error" onAction={refetch} />}

        {status === "success" && rentals.length === 0 && (
          <StateMessage variant="emptyRentals" onAction={() => navigate("/")} />
        )}

        {status === "success" &&
          rentals.map((rental) => (
            <RentalCard
              key={rental.id}
              rental={rental}
              role={role}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
              onHandover={handleHandover}
              onMarkReturned={handleMarkReturned}
              onDispute={handleOpenDispute}
            />
          ))}
      </div>

      {returnTarget && (
        <ConfirmReturnModal
          toolName={returnTarget.tool.name}
          onConfirm={confirmReturn}
          onCancel={() => setReturnTarget(null)}
        />
      )}

      {disputeTarget && (
        <DisputeFormModal
          rental={disputeTarget}
          onConfirm={confirmDispute}
          onCancel={() => setDisputeTarget(null)}
        />
      )}
    </div>
  );
}