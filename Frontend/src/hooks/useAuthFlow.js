import { useEffect, useRef, useState } from "react";
import { requestOtp, verifyOtp } from "../services/api";

const RESEND_SECONDS = 105; // ۱:۴۵ — مطابق طراحی

/**
 * مدیریت فلوی سه‌مرحله‌ای ورود: phone → otp → success
 * step هم به UI گفته می‌شه کدوم state رو نشون بده.
 */
export function useAuthFlow() {
  const [step, setStep] = useState("phone"); // phone | otp | success
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (step !== "otp") return;
    setSecondsLeft(RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const submitPhone = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await requestOtp(phone);
      setOtpDigits(["", "", "", ""]);
      setStep("otp");
    } catch (err) {
      setErrorMessage(err.message || "ارسال کد ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOtp = async (code) => {
    const otpCode = code ?? otpDigits.join("");
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await verifyOtp(phone, otpCode);
      setStep("success");
    } catch (err) {
      setErrorMessage(err.message || "کد وارد شده صحیح نیست");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (secondsLeft > 0) return;
    setOtpDigits(["", "", "", ""]);
    await requestOtp(phone);
    setSecondsLeft(RESEND_SECONDS);
  };

  const goBackToPhone = () => {
    setStep("phone");
    setErrorMessage(null);
  };

  return {
    step,
    phone,
    setPhone,
    otpDigits,
    setOtpDigits,
    secondsLeft,
    isSubmitting,
    errorMessage,
    submitPhone,
    submitOtp,
    resendOtp,
    goBackToPhone,
  };
}
