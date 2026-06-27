const VARIANT_CLASSES = {
  primary: "bg-primary-600 text-white border-primary-600 hover:bg-primary-700 hover:border-primary-700",
  outline: "bg-white text-gray-900 border-gray-200 hover:bg-gray-50",
  ghost: "bg-transparent text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-900",
  danger: "bg-danger-600 text-white border-danger-600 hover:bg-[#9c2916]",
  dangerOutline: "bg-white text-danger-600 border-danger-50 hover:bg-danger-50",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-sm",
  base: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-md",
};

/** دکمه‌ی مشترک پروژه — معادل کلاس‌های .btn / .btn-primary / .btn-outline در shared.css */
export default function Button({
  variant = "primary",
  size = "base",
  full = false,
  disabled = false,
  icon = null,
  children,
  className = "",
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border font-medium leading-none transition ${
        VARIANT_CLASSES[variant]
      } ${SIZE_CLASSES[size]} ${full ? "w-full" : ""} ${
        disabled ? "cursor-not-allowed border-gray-300 bg-gray-300 text-white hover:bg-gray-300" : ""
      } ${className}`}
      {...props}
    >
      {icon && <i className={icon} />}
      {children}
    </button>
  );
}
