// src/components/admin/AdminRoute.jsx
//
// محافظ مسیرهای ادمین. فقط کاربرهایی که is_admin=true دارن اجازه‌ی ورود دارن.
// بقیه (لاگین‌نکرده یا کاربر عادی) به صفحه‌ی اصلی هدایت می‌شن.

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  // تا وقتی وضعیت کاربر (/auth/me/) مشخص نشده چیزی رندر نکن
  if (loading) return null;

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}