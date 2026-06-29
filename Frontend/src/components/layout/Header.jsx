// src/components/layout/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header({ searchValue, onSearchChange }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-[100] flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
      {/* لوگو */}
      <a href="/" className="flex min-w-fit items-center gap-2 text-[16px] font-semibold text-gray-900">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-md bg-primary-600 text-white">
          <i className="fa-solid fa-screwdriver-wrench" />
        </div>
        هم‌ابزار
      </a>

      {/* سرچ بار */}
      <div className="relative max-w-[420px] flex-1">
        <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[15px] text-gray-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="جستجوی ابزار، دسته‌بندی یا شهر..."
          className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 px-4 pl-11 text-right text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-primary-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,107,74,.1)]"
        />
      </div>

      {/* ناوبری */}
      <nav className="mr-auto hidden items-center gap-1 md:flex">
        <span className="cursor-pointer rounded-md px-3 py-2 text-base font-medium text-primary-600">
          کاوش
        </span>
        <Link
          to="/my-tools"
          className="cursor-pointer rounded-md px-3 py-2 text-base text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          ابزارهای من
        </Link>
        <Link
          to="/my-rentals"
          className="cursor-pointer rounded-md px-3 py-2 text-base text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          اجاره‌هایم
        </Link>
        <span className="cursor-pointer rounded-md px-3 py-2 text-base text-gray-500 transition hover:bg-gray-100 hover:text-gray-900">
          راهنما
        </span>
      </nav>

      {/* اکشن‌ها */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50">
          <i className="fa-regular fa-bell" />
          <span className="hidden sm:inline">اعلان‌ها</span>
        </button>

        {/* بخش auth — اگه لود هست چیزی نشون نده تا flicker نزنه */}
        {!loading && (
          <>
            {user ? (
              // کاربر لاگین کرده
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                >
                  <i className="fa-regular fa-user" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user.full_name || user.username || user.phone}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-red-600"
                  title="خروج"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            ) : (
              // کاربر لاگین نکرده
              <Link
                to="/auth"
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
              >
                <i className="fa-regular fa-user" />
                <span className="hidden sm:inline">ورود / ثبت‌نام</span>
              </Link>
            )}
          </>
        )}

        <Link
          to="/tools/new"
          className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          <i className="fa-solid fa-plus" />
          ثبت ابزار
        </Link>
      </div>
    </header>
  );
}