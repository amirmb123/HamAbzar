import { useState } from "react";
import { createTool } from "../services/api";

const MIN_DESCRIPTION_LENGTH = 50;
const MIN_IMAGES = 3;

export function useToolForm() {
  const [currentStep, setCurrentStep] = useState(2); // طبق طراحی، نمونه از مرحله ۲ شروع می‌شود
  const [isSubmitting, setIsSubmitting] = useState(false);

  // اطلاعات پایه (مرحله ۲)
  const [categoryId, setCategoryId] = useState(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [specs, setSpecs] = useState([{ label: "", value: "" }]);

  // تصاویر (پیش‌نمایش مرحله ۳، در همین صفحه نمایش داده می‌شود طبق طراحی)
  const [images, setImages] = useState([]);

  // تنظیمات اجاره
  const [fastDelivery, setFastDelivery] = useState(true);
  const [manualApproval, setManualApproval] = useState(false);
  const [hourlyRental, setHourlyRental] = useState(false);

  const addSpecRow = () => setSpecs((prev) => [...prev, { label: "", value: "" }]);
  const removeSpecRow = (idx) => setSpecs((prev) => prev.filter((_, i) => i !== idx));
  const updateSpecRow = (idx, field, value) => {
    setSpecs((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const addImage = (url) => setImages((prev) => [...prev, url]);
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
    // مرحله‌ی نهایی: انتشار آگهی
    setIsSubmitting(true);
    try {
      await createTool({
        category_id: categoryId,
        name,
        brand,
        model,
        description,
        condition,
        specs: specs.filter((s) => s.label && s.value),
        images,
        fast_delivery: fastDelivery,
        manual_approval: manualApproval,
        hourly_rental: hourlyRental,
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
    categoryId,
    setCategoryId,
    name,
    setName,
    brand,
    setBrand,
    model,
    setModel,
    description,
    setDescription,
    condition,
    setCondition,
    specs,
    addSpecRow,
    removeSpecRow,
    updateSpecRow,
    images,
    addImage,
    removeImage,
    fastDelivery,
    setFastDelivery,
    manualApproval,
    setManualApproval,
    hourlyRental,
    setHourlyRental,
    minDescriptionLength: MIN_DESCRIPTION_LENGTH,
    minImages: MIN_IMAGES,
  };
}
