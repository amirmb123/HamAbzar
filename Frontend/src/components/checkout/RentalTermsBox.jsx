const TERMS = [
  "ابزار باید در همان وضعیت تحویلی بازگردانده شود",
  "ودیعه پس از بررسی ابزار توسط صاحب آن ظرف ۲۴ ساعت بازگردانده می‌شود",
  "در صورت تأخیر در بازگشت، روزانه ۱۵٪ از مبلغ کرایه جریمه محاسبه می‌شود",
];

export default function RentalTermsBox() {
  return (
    <div className="rounded-md bg-gray-50 p-4">
      {TERMS.map((term, idx) => (
        <div key={idx} className={`flex items-start gap-3 ${idx < TERMS.length - 1 ? "mb-3" : ""}`}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs text-primary-600">
            <i className="fa-solid fa-check" />
          </div>
          <p className="text-sm leading-relaxed text-gray-700">{term}</p>
        </div>
      ))}
    </div>
  );
}
