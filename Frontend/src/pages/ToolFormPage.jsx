import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToolForm } from "../hooks/useToolForm";
import { fetchCategories, fetchCities } from "../services/api";

import CategorySelectGrid from "../components/toolform/CategorySelectGrid";
import LocationPicker from "../components/toolform/LocationPicker";
import FormField from "../components/common/FormField";
import ImageUploadGrid from "../components/toolform/ImageUploadGrid";
import TipBox from "../components/toolform/TipBox";
import Button from "../components/common/Button";

function SectionTitle({ icon, title, desc }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-600">
        <i className={icon} />
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
    </div>
  );
}

export default function ToolFormPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const {
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

    minImages,
    maxImages,
  } = useToolForm();

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchCities().then(setCities);
  }, []);

  // ساخت ابزار نیاز به احراز هویت دارد (POST /api/tools/ → IsAuthenticated)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async () => {
    const result = await submit();
    if (result.success) {
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

      <div className="mx-auto max-w-[720px] px-6 py-8">
        <h1 className="mb-1 text-xl font-bold text-gray-900">اطلاعات ابزار</h1>
        <p className="mb-8 text-base text-gray-500">
          اطلاعات دقیق و کامل به اجاره سریع‌تر ابزار شما کمک می‌کند
        </p>

        {/* دسته‌بندی */}
        <SectionTitle icon="fa-solid fa-shapes" title="دسته‌بندی ابزار" />
        <div className="mb-4">
          <CategorySelectGrid categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
        </div>

        <div className="my-8 h-px bg-gray-100" />

        {/* اطلاعات پایه */}
        <SectionTitle icon="fa-solid fa-circle-info" title="اطلاعات پایه" />

        <FormField
          label="نام ابزار"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: دریل بوش ۱۶ میلی ضربه‌ای"
          hint="نام واضح و شامل برند و مدل وارد کنید"
        />

        <FormField
          as="textarea"
          label="توضیحات"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ابزار را با جزئیات توصیف کنید: وضعیت ظاهری، متعلقات همراه، نحوه استفاده و..."
        />

        <TipBox>
          آگهی‌هایی که توضیحات کامل دارند، تا ۳ برابر سریع‌تر رزرو می‌شوند.
        </TipBox>

        <div className="my-8 h-px bg-gray-100" />

        {/* تصاویر */}
        <SectionTitle icon="fa-solid fa-images" title="تصاویر ابزار" />
        <div className="mb-4">
          <ImageUploadGrid images={images} onAdd={addImage} onRemove={removeImage} minImages={minImages} maxImages={maxImages} />
        </div>

        <div className="my-8 h-px bg-gray-100" />

        {/* قیمت و ودیعه */}
        <SectionTitle icon="fa-solid fa-tag" title="قیمت اجاره" />
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <FormField
              label="قیمت روزانه (تومان)"
              required
              type="number"
              min="1"
              value={dailyPrice}
              onChange={(e) => setDailyPrice(e.target.value)}
              placeholder="مثال: ۱۵۰۰۰۰"
            />
          </div>
          <div className="flex-1">
            <FormField
              label="مبلغ ودیعه (تومان)"
              type="number"
              min="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="اختیاری — مثال: ۵۰۰۰۰۰"
            />
          </div>
        </div>

        <div className="my-8 h-px bg-gray-100" />

        {/* موقعیت مکانی */}
        <SectionTitle icon="fa-solid fa-location-dot" title="موقعیت مکانی" desc="محل تحویل ابزار" />

        <FormField
          as="select"
          label="شهر"
          required
          value={cityId ?? ""}
          onChange={(e) => setCityId(Number(e.target.value) || null)}
        >
          <option value="">انتخاب کنید</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </FormField>

        <FormField
          label="آدرس"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="اختیاری — مثال: خیابان ولیعصر، نرسیده به میدان ونک"
        />

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            موقعیت روی نقشه <span className="text-danger-600">*</span>
          </label>
          <LocationPicker latitude={latitude} longitude={longitude} onChange={setLocation} />
        </div>

        {submitError && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-danger-50 px-4 py-3 text-sm text-danger-600">
            <i className="fa-solid fa-circle-exclamation" />
            {submitError}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 mt-8 flex items-center justify-end border-t border-gray-200 bg-white px-6 py-4">
        <Button onClick={handleSubmit} disabled={isSubmitting || !isFormValid} size="lg">
          {isSubmitting ? "در حال ثبت..." : "ثبت"}
          {!isSubmitting && <i className="fa-solid fa-check" />}
        </Button>
      </div>
    </div>
  );
}
