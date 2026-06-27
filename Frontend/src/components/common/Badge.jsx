const VARIANT_CLASSES = {
  green: "bg-primary-50 text-primary-600",
  red: "bg-danger-50 text-danger-600",
  gray: "bg-gray-100 text-gray-500",
  amber: "bg-warning-50 text-warning-600",
  info: "bg-info-50 text-info-600",
};

export default function Badge({ variant = "gray", icon, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {icon && <i className={icon} />}
      {children}
    </span>
  );
}
