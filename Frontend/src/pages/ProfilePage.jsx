import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { formatPrice, formatRating } from "../utils/format";

import AppHeader from "../components/layout/AppHeader";
import Avatar from "../components/common/Avatar";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    avatarFile, setAvatarFile,
    isSubmitting,
    submitError,
    saved,
    submit,
  } = useProfile();

  const [avatarPreview, setAvatarPreview] = useState(null);

  // پروفایل نیاز به احراز هویت دارد (GET/PATCH /api/auth/me/ → IsAuthenticated)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // پیش‌نمایش آواتار جدید قبل از ذخیره — با createObjectURL، آزادسازی در cleanup
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  if (authLoading || !user) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
        <AppHeader activePath="/profile" />
        <div className="py-12 text-center text-gray-500">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      <AppHeader activePath="/profile" />

      <div className="mx-auto max-w-[640px] p-6">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">پروفایل من</h1>
        <p className="mb-6 text-base text-gray-500">مشاهده و ویرایش اطلاعات حساب کاربری</p>

        {/* خلاصه حساب — اطلاعاتی که از همین صفحه قابل ویرایش نیستند */}
        <div className="mb-6 flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5">
          <div className="relative">
            <Avatar name={user.full_name || user.username} src={avatarPreview || user.avatar} size="lg" />
            <label className="absolute -bottom-1 -left-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-xs text-gray-500 transition hover:bg-gray-50 hover:text-primary-600">
              <i className="fa-solid fa-camera" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            </label>
          </div>

          <div className="flex-1">
            <div className="text-base font-semibold text-gray-900">{user.full_name || user.username}</div>
            <div className="mt-0.5 text-sm text-gray-500">{user.phone}</div>
          </div>

          <div className="flex gap-4 text-center">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                <i className="fa-solid fa-star ml-1 text-[12px] text-amber-500" />
                {formatRating(user.rating)}
              </div>
              <div className="text-xs text-gray-500">امتیاز</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{formatPrice(user.wallet_balance)}</div>
              <div className="text-xs text-gray-500">کیف پول</div>
            </div>
          </div>
        </div>

        {/* فرم ویرایش */}
        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-base font-bold text-gray-900">اطلاعات شخصی</h2>

          <div className="flex gap-4">
            <div className="flex-1">
              <FormField
                label="نام"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="مثال: امیر"
              />
            </div>
            <div className="flex-1">
              <FormField
                label="نام خانوادگی"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="مثال: رضایی"
              />
            </div>
          </div>

          <FormField
            label="ایمیل"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="اختیاری — مثال: amir@example.com"
          />

          <FormField label="نام کاربری" hint="نام کاربری قابل ویرایش نیست">
            <input
              disabled
              value={user.username || ""}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-base text-gray-500"
            />
          </FormField>

          {submitError && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-danger-50 px-4 py-3 text-sm text-danger-600">
              <i className="fa-solid fa-circle-exclamation" />
              {submitError}
            </div>
          )}

          {saved && !submitError && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-primary-50 px-4 py-3 text-sm text-primary-600">
              <i className="fa-solid fa-circle-check" />
              تغییرات با موفقیت ذخیره شد.
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
              {!isSubmitting && <i className="fa-solid fa-check" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
