import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import ToolDetailPage from "./pages/ToolDetailPage";
import AuthPage from "./pages/AuthPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyRentalsPage from "./pages/MyRentalsPage";
import MyToolsPage from "./pages/MyToolsPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import ReviewFormPage from "./pages/ReviewFormPage";
import ToolFormPage from "./pages/ToolFormPage";
import AdminDisputesPage from "./pages/AdminDisputesPage";
import AdminRoute from "./components/admin/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools/new" element={<ToolFormPage />} />
          <Route path="/tools/:id" element={<ToolDetailPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/checkout/:id" element={<CheckoutPage />} />
          <Route path="/my-rentals" element={<MyRentalsPage />} />
          <Route path="/my-tools" element={<MyToolsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/rentals/:rentalId/chat" element={<ChatPage />} />
          <Route path="/rentals/:rentalId/review" element={<ReviewFormPage />} />
          {/* فقط پنل شکایت‌ها (disputes) بک‌اندش آماده‌ست؛ بقیه‌ی صفحات ادمین
              فعلاً غیرفعالن و به این صفحه ریدایرکت میشن تا بک‌اندشون آماده بشه. */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Navigate to="/admin/disputes" replace />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tools"
            element={
              <AdminRoute>
                <Navigate to="/admin/disputes" replace />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/disputes"
            element={
              <AdminRoute>
                <AdminDisputesPage />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;