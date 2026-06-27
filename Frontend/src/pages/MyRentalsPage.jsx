import { useNavigate } from "react-router-dom";
import { useMyRentals } from "../hooks/useMyRentals";
import AppHeader from "../components/layout/AppHeader";
import RoleTabs from "../components/rentals/RoleTabs";
import StatusFilterChips from "../components/rentals/StatusFilterChips";
import RentalCard from "../components/rentals/RentalCard";
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
  } = useMyRentals();

  const handleCancel = (rental) => {
    // فعلاً فقط لاگ — وقتی Rental API آماده شد، اینجا POST /api/rentals/<id>/cancel/ صدا زده می‌شه
    console.log("لغو درخواست رزرو:", rental.id);
  };

  const handleMarkReturned = (rental) => {
    // وقتی Rental API آماده شد: POST /api/rentals/<id>/return/
    console.log("ثبت بازگشت ابزار:", rental.id);
  };

  const handlePayPenalty = (rental) => {
    console.log("پرداخت جریمه برای رزرو:", rental.id);
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
              onMarkReturned={handleMarkReturned}
              onPayPenalty={handlePayPenalty}
            />
          ))}
      </div>
    </div>
  );
}
