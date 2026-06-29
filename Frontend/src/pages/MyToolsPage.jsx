import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMyTools } from "../hooks/useMyTools";
import AppHeader from "../components/layout/AppHeader";
import MyToolCard from "../components/mytools/MyToolCard";
import ConfirmDeleteToolModal from "../components/mytools/ConfirmDeleteToolModal";
import StateMessage from "../components/common/StateMessage";
import Button from "../components/common/Button";

export default function MyToolsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { tools, status, refetch, pendingId, toggleAvailability, removeTool } = useMyTools();

  // ابزاری که در حال تایید حذف آن هستیم (یا null)
  const [deleteTarget, setDeleteTarget] = useState(null);

  // این صفحه فقط برای کاربر لاگین‌کرده معنا دارد
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const handleEdit = (tool) => {
    // ⚠️ صفحه‌ی ویرایش اختصاصی (/tools/:id/edit) هنوز وجود ندارد.
    // فعلاً به صفحه‌ی جزئیات ابزار هدایت می‌کنیم تا لینک مرده ساخته نشود.
    navigate(`/tools/${tool.id}`);
  };

  const handleDelete = (tool) => {
    setDeleteTarget(tool);
  };

  const confirmDelete = async () => {
    const ok = await removeTool(deleteTarget.id);
    if (!ok) throw new Error("حذف ابزار ناموفق بود.");
    setDeleteTarget(null);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      <AppHeader activePath="/my-tools" />

      <div className="mx-auto max-w-[1040px] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">ابزارهای من</h1>
            <p className="text-base text-gray-500">مدیریت آگهی‌های ثبت‌شده توسط شما</p>
          </div>
          <Button variant="primary" icon="fa-solid fa-plus" onClick={() => navigate("/tools/new")}>
            ثبت ابزار جدید
          </Button>
        </div>

        {status === "loading" && (
          <div className="py-12 text-center text-gray-500">در حال بارگذاری...</div>
        )}

        {status === "error" && <StateMessage variant="error" onAction={refetch} />}

        {status === "success" && tools.length === 0 && (
          <StateMessage variant="emptyMyTools" onAction={() => navigate("/tools/new")} />
        )}

        {status === "success" && tools.length > 0 && (
          <div className="flex flex-col gap-3">
            {tools.map((tool) => (
              <MyToolCard
                key={tool.id}
                tool={tool}
                isPending={pendingId === tool.id}
                onToggleAvailability={toggleAvailability}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDeleteToolModal
          toolName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
