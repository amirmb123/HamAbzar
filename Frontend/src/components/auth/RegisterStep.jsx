import { useState } from "react";
import Button from "../common/Button";

export default function RegisterStep({ phone, onSubmit, isSubmitting, errorMessage }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    password2: "",
    email: "",
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const isValid =
    form.firstName &&
    form.lastName &&
    form.username.length >= 3 &&
    form.password.length >= 8 &&
    form.password === form.password2;

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary-50 text-2xl text-primary-600">
          <i className="fa-solid fa-user-plus" />
        </div>
        <div className="mb-2 text-2xl font-bold text-gray-900">تکمیل ثبت‌نام</div>
        <div className="text-base leading-relaxed text-gray-500">
          برای شماره <strong dir="ltr">{`0${phone}`}</strong> حساب جدیدی می‌سازیم
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-gray-900">نام</label>
          <input
            type="text"
            value={form.firstName}
            onChange={set("firstName")}
            placeholder="علی"
            className="w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(26,107,74,.1)]"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-gray-900">نام خانوادگی</label>
          <input
            type="text"
            value={form.lastName}
            onChange={set("lastName")}
            placeholder="رضایی"
            className="w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(26,107,74,.1)]"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-900">نام کاربری</label>
        <input
          type="text"
          value={form.username}
          onChange={set("username")}
          placeholder="ali_rezaei"
          dir="ltr"
          className="w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(26,107,74,.1)]"
        />
        <div className="mt-1 text-xs text-gray-400">حداقل ۳ کاراکتر، فقط حرف و عدد و آندرلاین</div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-900">رمز عبور</label>
        <input
          type="password"
          value={form.password}
          onChange={set("password")}
          placeholder="حداقل ۸ کاراکتر"
          dir="ltr"
          className="w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(26,107,74,.1)]"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-900">تکرار رمز عبور</label>
        <input
          type="password"
          value={form.password2}
          onChange={set("password2")}
          placeholder="رمز عبور را دوباره وارد کنید"
          dir="ltr"
          className={`w-full rounded-md border px-3.5 py-2.5 text-sm outline-none transition focus:shadow-[0_0_0_3px_rgba(26,107,74,.1)] ${
            form.password2 && form.password !== form.password2
              ? "border-red-400 focus:border-red-400"
              : "border-gray-200 focus:border-primary-600"
          }`}
        />
        {form.password2 && form.password !== form.password2 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <i className="fa-solid fa-circle-exclamation" />
            رمزهای عبور یکسان نیستند
          </div>
        )}
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-gray-900">
          ایمیل <span className="text-gray-400 font-normal">(اختیاری)</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="example@email.com"
          dir="ltr"
          className="w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(26,107,74,.1)]"
        />
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-center gap-1 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-600">
          <i className="fa-solid fa-circle-exclamation" />
          {errorMessage}
        </div>
      )}

      <Button
        size="lg"
        full
        disabled={!isValid || isSubmitting}
        onClick={() => onSubmit(form)}
      >
        {isSubmitting ? "در حال ثبت‌نام..." : "ثبت‌نام و ورود"}
      </Button>
    </div>
  );
}
