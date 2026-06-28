import { useState } from "react";
import { createTool } from "../services/api";

const MIN_DESCRIPTION_LENGTH = 50;
const MIN_IMAGES = 3;

export function useToolForm() {
  const [currentStep, setCurrentStep] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // اطلاعات پایه (مرحله ۲)
  const [categoryId, setCategoryId] = useState(null);
  const [name, setName]             = useState("");
  const [brand, setBrand]           = useState("");
  const [model, setModel]           = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition]   = useState("");
  const [specs, setSpecs]           = useState([{ label: "", value: "" }]);

  // تصاویر — File objects (از input type=file)
  const [images, setImages] = useState([]);

  // قیمت و ودیعه (مرحله ۴)
  const [dailyPrice, setDailyPrice]       = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  // موقعیت (مرحله ۵)
  const [cityId, setCityId]       = useState(null);
  const [latitude, setLatitude]   = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress]     = useState("");

  // تنظیمات اجاره
  const [fastDelivery, setFastDelivery]     = useState(true);
  const [manualApproval, setManualApproval] = useState(false);
  const [hourlyRental, setHourlyRental]     = useState(false);

  const addSpecRow    = () => setSpecs((prev) => [...prev, { label: "", value: "" }]);
  const removeSpecRow = (idx) => setSpecs((prev) => prev.filter((_, i) => i !== idx));
  const updateSpecRow = (idx, field, value) => {
    setSpecs((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const addImage    = (file) => setImages((prev) => [...prev, file]);
  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const isStepValid =
    Boolean(categoryId) &&
    name.trim().length > 0 &&
    description.trim().length >= MIN_DESCRIPTION_LENGTH &&
    Boolean(condition) &&
    images.length >= MIN_IMAGES;

  const goToPrevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  const goToNextStep = async () => {
    if (currentStep < 6) {
      setCurrentStep((s) => s + 1);
      return;
    }
    setIsSubmitting(true);
    try {
      await createTool({
        category_id:    categoryId,
        name,
        description,
        // فیلدهای اضافه (فعلاً در توضیحات ادغام میشن تا بک‌اند پشتیبانی کنه)
        // brand, model, condition, specs در نسخه بعد به مدل اضافه می‌شن
        daily_price:    Number(dailyPrice)    || 0,
        deposit_amount: Number(depositAmount) || 0,
        city_id:        cityId,
        latitude:       latitude  || "35.6892",   // fallback: تهران
        longitude:      longitude || "51.3890",
        images,
      });
      return { published: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    goToPrevStep,
    goToNextStep,
    isSubmitting,
    isStepValid,
    // مرحله ۲
    categoryId, setCategoryId,
    name, setName,
    brand, setBrand,
    model, setModel,
    description, setDescription,
    condition, setCondition,
    specs, addSpecRow, removeSpecRow, updateSpecRow,
    // مرحله ۳
    images, addImage, removeImage,
    // مرحله ۴
    dailyPrice, setDailyPrice,
    depositAmount, setDepositAmount,
    // مرحله ۵
    cityId, setCityId,
    latitude, setLatitude,
    longitude, setLongitude,
    address, setAddress,
    // تنظیمات
    fastDelivery, setFastDelivery,
    manualApproval, setManualApproval,
    hourlyRental, setHourlyRental,
    // ثابت‌ها
    minDescriptionLength: MIN_DESCRIPTION_LENGTH,
    minImages: MIN_IMAGES,
  };
}