// src/hooks/useAuthFlow.js
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOtp, verifyOtp, registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

const RESEND_SECONDS = 105;

export function useAuthFlow() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [step, setStep]             = useState("phone"); // phone | otp | register | success
  const [phone, setPhone]           = useState("");
  const [otpDigits, setOtpDigits]   = useState(["", "", "", "", "", ""]);
  const [tempToken, setTempToken]   = useState(null);
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
      setOtpDigits(["", "", "", "", "", ""]);
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
      const res = await verifyOtp(phone, otpCode);

      if (res.next === "login") {
        // کاربر قدیمی — توکن + اطلاعات کاربر آماده‌ست
        login(res.data.user, { access: res.data.access, refresh: res.data.refresh });
        navigate("/", { replace: true });
      } else if (res.next === "register") {
        setTempToken(res.data.temp_token);
        setStep("register");
      }
    } catch (err) {
      setErrorMessage(err.message || "کد وارد شده صحیح نیست");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRegister = async (form) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await registerUser({
        temp_token: tempToken,
        first_name: form.firstName,
        last_name:  form.lastName,
        username:   form.username,
        password:   form.password,
        password2:  form.password2,
        email:      form.email,
      });
      // کاربر جدید — توکن + اطلاعات کاربر آماده‌ست
      login(res.data.user, { access: res.data.access, refresh: res.data.refresh });
      navigate("/", { replace: true });
    } catch (err) {
      setErrorMessage(err.message || "خطا در ثبت‌نام. دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (secondsLeft > 0) return;
    setOtpDigits(["", "", "", "", "", ""]);
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
    submitRegister,
    resendOtp,
    goBackToPhone,
  };
}