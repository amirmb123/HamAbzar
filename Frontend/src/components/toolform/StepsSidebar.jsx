const STEPS = [
  { id: 1, title: "دسته‌بندی", desc: "انتخاب نوع ابزار" },
  { id: 2, title: "اطلاعات پایه", desc: "نام، توضیحات و مشخصات" },
  { id: 3, title: "تصاویر", desc: "حداقل ۳ عکس بارگذاری کنید" },
  { id: 4, title: "قیمت و ودیعه", desc: "تعیین نرخ اجاره روزانه" },
  { id: 5, title: "موقعیت مکانی", desc: "آدرس تحویل ابزار" },
  { id: 6, title: "بازبینی و انتشار", desc: "پیش‌نمایش نهایی آگهی" },
];

export default function StepsSidebar({ currentStep }) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-[260px] min-w-[220px] border-l border-gray-200 bg-white px-5 py-6 lg:block">
      {STEPS.map((step, idx) => {
        const isDone = step.id < currentStep;
        const isActive = step.id === currentStep;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.id} className="relative flex items-start gap-3 py-3">
            {!isLast && (
              <div
                className={`absolute right-[15px] top-[38px] bottom-[-8px] w-[1.5px] ${
                  isDone ? "bg-primary-600" : "bg-gray-200"
                }`}
              />
            )}
            <div
              className={`z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isDone
                  ? "border-[1.5px] border-primary-600 bg-primary-50 text-primary-600"
                  : isActive
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {isDone ? <i className="fa-solid fa-check text-xs" /> : step.id}
            </div>
            <div>
              <div className={`text-base font-medium ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                {step.title}
              </div>
              <div className="mt-0.5 text-xs text-gray-400">{step.desc}</div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
