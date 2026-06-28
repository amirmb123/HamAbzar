const STATUS_CONFIG = {
  pending: { icon: "fa-solid fa-clock", label: "در انتظار تأیید صاحب", className: "bg-warning-50 text-warning-600" },
  confirmed: { icon: "fa-solid fa-check", label: "تأیید شده", className: "bg-info-50 text-info-600" },
  active: { icon: "fa-solid fa-circle-play", label: "در حال استفاده", className: "bg-info-50 text-info-600" },
  returned: { icon: "fa-solid fa-circle-check", label: "تکمیل‌شده", className: "bg-primary-50 text-primary-600" },
  cancelled: { icon: "fa-solid fa-ban", label: "لغوشده", className: "bg-gray-100 text-gray-500" },
  disputed: { icon: "fa-solid fa-flag", label: "در حال بررسی", className: "bg-gray-100 text-gray-500" },
};

export default function RentalStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.cancelled;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <i className={config.icon} />
      {config.label}
    </span>
  );
}