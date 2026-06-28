import { useState } from "react";
import { createTool, ApiError } from "../services/api";

// ─────────────────────────────────────────────
// قوانین اعتبارسنجی سمت فرانت
// (فیلدهای الزامی واقعی روی بک‌اند: name, category, city, daily_price,
//  latitude, longitude — توضیحات و آدرس و ودیعه اختیاری هستند. حداقل
//  یک تصویر هم برای کیفیت آگهی در سمت فرانت الزامی شده، نه بک‌اند.)
// ─────────────────────────────────────────────
const MIN_IMAGES = 1;
const MAX_IMAGES = 5; // برابر با محدودیت بک‌اند (ToolImageUploadSerializer)

export function useToolForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // دسته‌بندی و شهر
  const [categoryId, setCategoryId] = useState(null);
  const [cityId, setCityId]         = useState(null);

  // اطلاعات پایه
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");

  // تصاویر — آرایه‌ای از File واقعی
  const [images, setImages] = useState([]);

  // قیمت و ودیعه
  const [dailyPrice, setDailyPrice]       = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  // موقعیت مکانی
  const [latitude, setLatitude]   = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress]     = useState("");

  const addImage    = (file) => setImages((prev) => [...prev, file]);
  const removeImage = (idx)  => setImages((prev) => prev.filter((_, i) => i !== idx));

  const setLocation = (lat, lng) => {
    // بک‌اند: DecimalField(max_digits=9, decimal_places=6) → حداکثر ۶ رقم اعشار.
    // مقادیر خام geolocation/نقشه گاهی ۱۵+ رقم اعشار دارند و باعث خطای
    // «Ensure that there are no more than 9 digits in total» می‌شوند.
    setLatitude(Math.round(lat * 1e6) / 1e6);
    setLongitude(Math.round(lng * 1e6) / 1e6);
  };

  const isFormValid =
    Boolean(categoryId) &&
    Boolean(cityId) &&
    name.trim().length > 0 &&
    Number(dailyPrice) > 0 &&
    latitude !== null &&
    longitude !== null &&
    images.length >= MIN_IMAGES;

  const submit = async () => {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const result = await createTool({
        category: categoryId,
        city: cityId,
        name: name.trim(),
        description: description.trim(),
        daily_price: Number(dailyPrice) || 0,
        deposit_amount: Number(depositAmount) || 0,
        latitude,
        longitude,
        address: address.trim(),
        images,
      });
      return { success: true, id: result.data.id };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ثبت ابزار. لطفاً دوباره تلاش کنید.";
      setSubmitError(message);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitError,
    isFormValid,
    submit,

    categoryId, setCategoryId,
    cityId, setCityId,

    name, setName,
    description, setDescription,

    images, addImage, removeImage,

    dailyPrice, setDailyPrice,
    depositAmount, setDepositAmount,

    latitude,
    longitude,
    address, setAddress,
    setLocation,

    minImages: MIN_IMAGES,
    maxImages: MAX_IMAGES,
  };
}