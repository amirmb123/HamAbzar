import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { useAdminToolsQueue } from "../hooks/useAdminToolsQueue";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import KpiGrid from "../components/admin/KpiGrid";
import RentalTrendChart from "../components/admin/RentalTrendChart";
import PendingApprovalsList from "../components/admin/PendingApprovalsList";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data, status } = useAdminDashboard();
  const { counts } = useAdminToolsQueue();

  const handleSidebarSelect = (itemId) => {
    if (itemId === "tools") navigate("/admin/tools");
    // "overview" یعنی همینجا — کاری لازم نیست
  };

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <AdminSidebar activeItemId="overview" onSelect={handleSidebarSelect} pendingToolsCount={counts.pending} />

      <div className="flex-1 overflow-y-auto">
        <AdminTopbar title="نمای کلی" />

        <div className="p-6">
          {status === "loading" && (
            <div className="py-20 text-center text-gray-400">در حال بارگذاری داشبورد...</div>
          )}

          {status === "error" && (
            <div className="py-20 text-center text-gray-400">دریافت اطلاعات داشبورد با خطا مواجه شد.</div>
          )}

          {status === "success" && (
            <>
              <KpiGrid kpis={data.kpis} />

              <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
                <RentalTrendChart data={data.rental_trend} />
                <PendingApprovalsList items={data.pending_approvals} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
