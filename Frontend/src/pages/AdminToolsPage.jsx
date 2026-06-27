import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminToolsQueue } from "../hooks/useAdminToolsQueue";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import ToolsStatusTabs from "../components/admin/ToolsStatusTabs";
import ToolsManagementTable from "../components/admin/ToolsManagementTable";
import RejectReasonModal from "../components/admin/RejectReasonModal";
import ConfirmDeleteModal from "../components/admin/ConfirmDeleteModal";

export default function AdminToolsPage() {
  const navigate = useNavigate();
  const { tools, counts, activeTab, setActiveTab, status, handleApprove, handleReject, handleDelete } =
    useAdminToolsQueue();

  const [toolToReject, setToolToReject] = useState(null);
  const [toolToDelete, setToolToDelete] = useState(null);

  const handleSidebarSelect = (itemId) => {
    if (itemId === "overview") navigate("/admin");
    // "tools" یعنی همینجا — کاری لازم نیست
  };

  const confirmReject = async (reason) => {
    await handleReject(toolToReject, reason);
    setToolToReject(null);
  };

  const confirmDelete = async () => {
    await handleDelete(toolToDelete);
    setToolToDelete(null);
  };

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <AdminSidebar activeItemId="tools" onSelect={handleSidebarSelect} pendingToolsCount={counts.pending} />

      <div className="flex-1 overflow-y-auto">
        <AdminTopbar title="مدیریت ابزارها" />

        <div className="p-6">
          <ToolsStatusTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />

          {status === "loading" && (
            <div className="py-16 text-center text-gray-400">در حال بارگذاری...</div>
          )}

          {status === "error" && (
            <div className="py-16 text-center text-gray-400">دریافت لیست ابزارها با خطا مواجه شد.</div>
          )}

          {status === "success" && (
            <ToolsManagementTable
              tools={tools}
              onApprove={handleApprove}
              onReject={setToolToReject}
              onDelete={setToolToDelete}
            />
          )}
        </div>
      </div>

      {toolToReject && (
        <RejectReasonModal
          toolName={toolToReject.name}
          onConfirm={confirmReject}
          onCancel={() => setToolToReject(null)}
        />
      )}

      {toolToDelete && (
        <ConfirmDeleteModal
          toolName={toolToDelete.name}
          onConfirm={confirmDelete}
          onCancel={() => setToolToDelete(null)}
        />
      )}
    </div>
  );
}
