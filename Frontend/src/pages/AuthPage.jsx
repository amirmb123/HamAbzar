import { useAuthFlow } from "../hooks/useAuthFlow";
import BrandPanel from "../components/auth/BrandPanel";
import PhoneStep from "../components/auth/PhoneStep";
import OtpStep from "../components/auth/OtpStep";
import SuccessStep from "../components/auth/SuccessStep";

export default function AuthPage() {
  const {
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
  } = useAuthFlow();

  return (
    <div dir="rtl" className="flex min-h-screen font-sans">
      <BrandPanel />

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          {step === "phone" && (
            <PhoneStep
              phone={phone}
              onPhoneChange={setPhone}
              onSubmit={submitPhone}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
            />
          )}

          {step === "otp" && (
            <OtpStep
              phone={phone}
              otpDigits={otpDigits}
              onOtpChange={setOtpDigits}
              onSubmit={submitOtp}
              onBack={goBackToPhone}
              onResend={resendOtp}
              secondsLeft={secondsLeft}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
            />
          )}

          {step === "success" && <SuccessStep />}
        </div>
      </div>
    </div>
  );
}
