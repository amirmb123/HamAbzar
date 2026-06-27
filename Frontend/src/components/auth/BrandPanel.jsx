export default function BrandPanel() {
  return (
    <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 p-10 text-white lg:flex">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,.08) 0, transparent 35%), radial-gradient(circle at 80% 75%, rgba(255,255,255,.08) 0, transparent 40%)",
        }}
      />

      <div className="relative z-10 flex items-center gap-2 text-lg font-semibold">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-md bg-white/15 text-[17px]">
          <i className="fa-solid fa-screwdriver-wrench" />
        </div>
        هم‌ابزار
      </div>

      <div className="relative z-10 max-w-[380px]">
        <h1 className="mb-4 text-[30px] font-bold leading-relaxed">
          ابزار مورد نیازت رو از همسایه‌هات اجاره کن
        </h1>
        <p className="text-md leading-loose opacity-85">
          هزاران ابزار آماده اجاره در نزدیکی شما. سریع، مطمئن و با ضمانت بازگشت ودیعه.
        </p>

        <div className="mt-8 flex gap-8">
          <div>
            <div className="text-[22px] font-bold">+۱۲هزار</div>
            <div className="mt-0.5 text-xs opacity-75">ابزار فعال</div>
          </div>
          <div>
            <div className="text-[22px] font-bold">+۸هزار</div>
            <div className="mt-0.5 text-xs opacity-75">کاربر</div>
          </div>
          <div>
            <div className="text-[22px] font-bold">۴.۸</div>
            <div className="mt-0.5 text-xs opacity-75">میانگین رضایت</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-xs opacity-60">© ۱۴۰۵ هم‌ابزار — تمامی حقوق محفوظ است</div>
    </div>
  );
}
