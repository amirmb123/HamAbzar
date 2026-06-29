import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile } from "../services/api";

/**
 * فرم ویرایش پروفایل — مقدار اولیه از user داخل AuthContext خونده می‌شه
 * (چون همون موقع لاگین/لود اولیه اپ یک‌بار از /auth/me/ گرفته شده).
 */
export function useProfile() {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.full_name?.split(" ")?.[0] ?? "");
  const [lastName, setLastName]   = useState(user?.full_name?.split(" ")?.slice(1).join(" ") ?? "");
  const [email, setEmail]         = useState(user?.email ?? "");
  const [avatarFile, setAvatarFile] = useState(null); // فایل جدید (در صورت انتخاب)

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState(null);
  const [saved, setSaved] = useState(false);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSaved(false);
    try {
      const payload = { first_name: firstName, last_name: lastName, email };
      if (avatarFile) payload.avatar = avatarFile;

      const updated = await updateMyProfile(payload);
      updateUser(updated);
      setAvatarFile(null);
      setSaved(true);
      return { success: true };
    } catch (err) {
      setSubmitError(err.message || "خطا در ذخیره تغییرات.");
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [firstName, lastName, email, avatarFile, updateUser]);

  return {
    user,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    avatarFile, setAvatarFile,
    isSubmitting,
    submitError,
    saved,
    submit,
  };
}
