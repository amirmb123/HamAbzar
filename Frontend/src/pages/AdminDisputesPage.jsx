import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDisputes } from "../hooks/useDisputes";
import { useAdminToolsQueue } from "../hooks/useAdminToolsQueue";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import DisputesStatusTabs from "../components/admin/DisputesStatusTabs";
import DisputesTable from "../components/admin/DisputesTable";
import ResolveDisputeModal from "../components/admin/ResolveDisputeModal";

export default function AdminDisputesPage() {
  const navigate = useNavigate();
  const { disputes, counts, activeTab, setActiveTab, status, resolve } = useDisputes();
  // فقط برای نشان دادن شمارش ابزارهای در انتظار روی آیتم «ابزارها» در سایدبار
  const { counts: toolCounts } = useAdminToolsQueue();

  const [disputeToResolve, setDisputeToResolve] = useState(null);

  const handleSidebarSelect = (itemId) => {
    if (itemId === "overview") navigate("/admin");
    if (itemId === "tools") navigate("/admin/tools");
    // "disputes" یعنی همینجا — کاری لازم نیست
  };

  const confirmResolve = async (payload) => {
    await resolve(disputeToResolve.id, payload);
    setDisputeToResolve(null);
  };

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <AdminSidebar
        activeItemId="disputes"
        onSelect={handleSidebarSelect}
        pendingToolsCount={toolCounts.pending}
        pendingDisputesCount={counts.open}
      />

      <div className="flex-1 overflow-y-auto">
        <AdminTopbar title="رسیدگی به شکایت‌ها" />

        <div className="p-6">
          <DisputesStatusTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />

          {status === "loading" && (
            <div className="py-16 text-center text-gray-400">در حال بارگذاری...</div>
          )}

          {status === "forbidden" && (
            <div className="py-16 text-center text-gray-400">
              <i className="fa-solid fa-lock mb-3 block text-3xl opacity-40" />
              دسترسی به این بخش فقط برای ادمین امکان‌پذیر است.
            </div>
          )}

          {status === "error" && (
            <div className="py-16 text-center text-gray-400">دریافت لیست شکایت‌ها با خطا مواجه شد.</div>
          )}

          {status === "success" && (
            <DisputesTable disputes={disputes} onResolve={setDisputeToResolve} />
          )}
        </div>
      </div>

      {disputeToResolve && (
        <ResolveDisputeModal
          dispute={disputeToResolve}
          onConfirm={confirmResolve}
          onCancel={() => setDisputeToResolve(null)}
        />
      )}
    </div>
  );
}
