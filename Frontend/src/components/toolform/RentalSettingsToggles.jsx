function ToggleRow({ title, desc, checked, onChange, isLast }) {
  return (
    <div className={`flex items-center justify-between py-3 ${!isLast ? "border-b border-gray-100" : ""}`}>
      <div>
        <div className="text-base font-medium text-gray-900">{title}</div>
        <div className="mt-0.5 text-xs text-gray-500">{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-[42px] shrink-0 rounded-full transition ${
          checked ? "bg-primary-600" : "bg-gray-200"
        }`}
      >
        <div
          className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all ${
            checked ? "right-[21px]" : "right-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

export default function RentalSettingsToggles({
  fastDelivery,
  onFastDeliveryChange,
  manualApproval,
  onManualApprovalChange,
  hourlyRental,
  onHourlyRentalChange,
}) {
  return (
    <div className="rounded-lg border border-gray-200 px-4">
      <ToggleRow
        title="تحویل سریع"
        desc="امکان تحویل ابزار در همان روز درخواست"
        checked={fastDelivery}
        onChange={onFastDeliveryChange}
      />
      <ToggleRow
        title="نیاز به تأیید دستی رزرو"
        desc="قبل از تأیید رزرو، درخواست را بررسی کنید"
        checked={manualApproval}
        onChange={onManualApprovalChange}
      />
      <ToggleRow
        title="امکان اجاره ساعتی"
        desc="علاوه بر اجاره روزانه"
        checked={hourlyRental}
        onChange={onHourlyRentalChange}
        isLast
      />
    </div>
  );
}
