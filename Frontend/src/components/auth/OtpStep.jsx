import { useEffect, useRef } from "react";
import Button from "../common/Button";
import { toPersianDigits } from "../../utils/format";

function formatTimer(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return toPersianDigits(`${m}:${s}`);
}

export default function OtpStep({
  phone,
  otpDigits,
  onOtpChange,
  onSubmit,
  onBack,
  onResend,
  secondsLeft,
  isSubmitting,
  errorMessage,
}) {
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    onOtpChange(next);

    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every((d) => d) && next.join("").length === 4) {
      onSubmit(next.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <i className="fa-solid fa-arrow-right" />
        بازگشت
      </button>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary-50 text-2xl text-primary-600">
          <i className="fa-solid fa-shield-halved" />
        </div>
        <div className="mb-2 text-2xl font-bold text-gray-900">کد تأیید را وارد کنید</div>
      </div>

      <div className="mb-6 flex items-center justify-center gap-1.5 text-center text-sm text-gray-500">
        کد ۴ رقمی به شماره{" "}
        <strong dir="ltr" className="inline-block text-gray-900">
          {toPersianDigits(`0${phone}`)}
        </strong>
        ارسال شد
        <button onClick={onBack} className="font-medium text-primary-600">
          ویرایش
        </button>
      </div>

      <div className="mb-2 flex justify-center gap-2" dir="ltr">
        {otpDigits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`flex h-[58px] w-[52px] items-center justify-center rounded-md border-[1.5px] text-center text-xl font-semibold text-gray-900 outline-none transition ${
              digit
                ? "border-primary-600 bg-primary-50"
                : "border-gray-200 bg-white focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(26,107,74,.12)]"
            }`}
          />
        ))}
      </div>

      {errorMessage && (
        <div className="flex items-center justify-center gap-1 text-xs text-danger-600">
          <i className="fa-solid fa-circle-exclamation" />
          {errorMessage}
        </div>
      )}

      <Button
        size="lg"
        full
        className="mt-6"
        disabled={otpDigits.some((d) => !d) || isSubmitting}
        onClick={() => onSubmit(otpDigits.join(""))}
      >
        {isSubmitting ? "در حال بررسی..." : "تأیید و ورود"}
      </Button>

      <div className="mt-5 text-center text-sm text-gray-500">
        {secondsLeft > 0 ? (
          <>
            ارسال مجدد کد تا <span className="font-semibold text-primary-600">{formatTimer(secondsLeft)}</span>
          </>
        ) : (
          <button onClick={onResend} className="font-medium text-primary-600">
            ارسال مجدد کد
          </button>
        )}
      </div>
    </div>
  );
}
