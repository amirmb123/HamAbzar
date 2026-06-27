import Button from "../common/Button";

export default function PhoneStep({ phone, onPhoneChange, onSubmit, isSubmitting, errorMessage }) {
  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary-50 text-2xl text-primary-600">
          <i className="fa-regular fa-user" />
        </div>
        <div className="mb-2 text-2xl font-bold text-gray-900">ورود به هم‌ابزار</div>
        <div className="text-base leading-relaxed text-gray-500">
          شماره موبایل خود را وارد کنید تا کد تأیید برایتان ارسال شود
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-900">شماره موبایل</label>
        <div className="flex items-center overflow-hidden rounded-md border border-gray-200 transition focus-within:border-primary-600 focus-within:shadow-[0_0_0_3px_rgba(26,107,74,.1)]">
          <span className="whitespace-nowrap border-l border-gray-200 bg-gray-50 px-3.5 py-2.5 text-base text-gray-500">
            +۹۸
          </span>
          <input
            type="tel"
            dir="ltr"
            maxLength={10}
            placeholder="912 345 6789"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ""))}
            className="flex-1 px-3.5 py-2.5 text-right text-md tracking-wide outline-none"
            style={{ textAlign: "left" }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-400">کد تأیید پیامکی برای این شماره ارسال خواهد شد</div>
        {errorMessage && (
          <div className="mt-1 flex items-center gap-1 text-xs text-danger-600">
            <i className="fa-solid fa-circle-exclamation" />
            {errorMessage}
          </div>
        )}
      </div>

      <Button
        size="lg"
        full
        disabled={phone.length !== 10 || isSubmitting}
        onClick={onSubmit}
        className="mt-2"
      >
        {isSubmitting ? "در حال ارسال..." : "دریافت کد تأیید"}
        {!isSubmitting && <i className="fa-solid fa-arrow-left" />}
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        یا
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <Button variant="outline" full className="mb-2" icon="fa-brands fa-google">
        ورود با گوگل
      </Button>

      <div className="mt-6 text-center text-xs leading-relaxed text-gray-400">
        با ورود، <a href="#" className="text-primary-600">قوانین و مقررات</a> و{" "}
        <a href="#" className="text-primary-600">حریم خصوصی</a> هم‌ابزار را می‌پذیرید
      </div>
    </div>
  );
}
