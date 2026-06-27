import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToolForm } from "../hooks/useToolForm";
import { fetchCategories, fetchToolConditions } from "../services/api";

import StepsSidebar from "../components/toolform/StepsSidebar";
import CategorySelectGrid from "../components/toolform/CategorySelectGrid";
import FormField from "../components/common/FormField";
import SpecsInputList from "../components/toolform/SpecsInputList";
import ImageUploadGrid from "../components/toolform/ImageUploadGrid";
import RentalSettingsToggles from "../components/toolform/RentalSettingsToggles";
import TipBox from "../components/toolform/TipBox";
import FormFooterBar from "../components/toolform/FormFooterBar";
import { toPersianDigits } from "../utils/format";

const TOTAL_STEPS = 6;

export default function ToolFormPage() {
  const navigate = useNavigate();
  const {
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
    minDescriptionLength,
    minImages,
  } = useToolForm();

  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchToolConditions().then(setConditions);
  }, []);

  const handleNext = async () => {
    // ⚠️ فقط مرحله‌ی ۲ (اطلاعات پایه) در این نسخه پیاده‌سازی شده. مراحل
    // ۱ و ۳ تا ۶ هنوز صفحه ندارند، پس به‌جای واقعاً جلو رفتن در stepper،
    // داده‌ی این مرحله را ذخیره (mock) می‌کنیم و کاربر را به کرایه‌های من
    // برمی‌گردانیم. وقتی بقیه‌ی مراحل ساخته شدند، این تابع باید
    // goToNextStep() واقعی را صدا بزند تا در stepper جلو برود.
    const result = await goToNextStep();
    if (result?.published) {
      navigate("/my-rentals");
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-md bg-primary-600 text-white">
            <i className="fa-solid fa-screwdriver-wrench" />
          </div>
          هم‌ابزار
        </div>
        <span className="text-md font-semibold text-gray-900">ثبت ابزار جدید</span>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
        >
          انصراف
          <i className="fa-solid fa-xmark" />
        </Link>
      </header>

      <div className="flex">
        <StepsSidebar currentStep={currentStep} />

        <div className="mx-auto max-w-[720px] flex-1 px-6 py-8">
          <h1 className="mb-1 text-xl font-bold text-gray-900">اطلاعات پایه ابزار</h1>
          <p className="mb-8 text-base text-gray-500">
            اطلاعات دقیق به اجاره سریع‌تر ابزار شما کمک می‌کند
          </p>

          {/* دسته‌بندی */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-900">
              دسته‌بندی ابزار <span className="text-danger-600">*</span>
            </label>
            <CategorySelectGrid categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
          </div>

          <div className="my-6 h-px bg-gray-100" />

          {/* نام */}
          <FormField
            label="نام ابزار"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: دریل بوش ۱۶ میلی ضربه‌ای"
            hint="نام واضح و شامل برند و مدل وارد کنید"
          />

          {/* برند / مدل */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <FormField
                label="برند"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="مثال: بوش، مکیتا، دیوالت"
              />
            </div>
            <div className="flex-1">
              <FormField
                label="مدل"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="مثال: GSB 16 RE"
              />
            </div>
          </div>

          {/* توضیحات */}
          <FormField
            as="textarea"
            label="توضیحات"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ابزار را با جزئیات توصیف کنید: وضعیت ظاهری، متعلقات همراه، نحوه استفاده و..."
            hint={`حداقل ${toPersianDigits(minDescriptionLength)} کاراکتر — در حال حاضر: ${toPersianDigits(
              description.length
            )} کاراکتر`}
          />

          {/* وضعیت */}
          <FormField
            as="select"
            label="وضعیت ابزار"
            required
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">انتخاب کنید</option>
            {conditions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FormField>

          <div className="my-6 h-px bg-gray-100" />

          {/* مشخصات فنی */}
          <div className="mb-2">
            <label className="mb-2 block text-sm font-medium text-gray-900">مشخصات فنی (اختیاری)</label>
            <SpecsInputList
              specs={specs}
              onUpdate={updateSpecRow}
              onAdd={addSpecRow}
              onRemove={removeSpecRow}
            />
          </div>

          <TipBox>
            آگهی‌هایی که توضیحات کامل و مشخصات فنی دقیق دارند، تا ۳ برابر سریع‌تر رزرو می‌شوند.
          </TipBox>

          <div className="my-6 h-px bg-gray-100" />

          {/* تصاویر */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-900">
              تصاویر ابزار <span className="text-danger-600">*</span>
            </label>
            <ImageUploadGrid
              images={images}
              onAdd={addImage}
              onRemove={removeImage}
              minImages={minImages}
            />
          </div>

          <div className="my-6 h-px bg-gray-100" />

          {/* تنظیمات اجاره */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-900">تنظیمات اجاره</label>
            <RentalSettingsToggles
              fastDelivery={fastDelivery}
              onFastDeliveryChange={setFastDelivery}
              manualApproval={manualApproval}
              onManualApprovalChange={setManualApproval}
              hourlyRental={hourlyRental}
              onHourlyRentalChange={setHourlyRental}
            />
          </div>
        </div>
      </div>

      <FormFooterBar
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onPrev={goToPrevStep}
        onNext={handleNext}
        isSubmitting={isSubmitting}
        isNextDisabled={!isStepValid}
      />
    </div>
  );
}
