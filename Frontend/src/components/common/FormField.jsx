/** فیلد فرم استاندارد پروژه — معادل .field / .field-label / .input در shared.css */
export default function FormField({
  label,
  required = false,
  hint,
  error,
  as = "input",
  children,
  ...inputProps
}) {
  const baseInputClass = `w-full rounded-md border px-3.5 py-2.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 ${
    error
      ? "border-danger-600 focus:shadow-[0_0_0_3px_rgba(192,52,29,.1)]"
      : "border-gray-200 focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(26,107,74,.1)]"
  }`;

  return (
    <div className="mb-4">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-900">
          {label} {required && <span className="text-danger-600">*</span>}
        </label>
      )}

      {children ? (
        children
      ) : as === "textarea" ? (
        <textarea className={`${baseInputClass} min-h-[100px] resize-y`} {...inputProps} />
      ) : as === "select" ? (
        <select className={baseInputClass} {...inputProps} />
      ) : (
        <input className={baseInputClass} {...inputProps} />
      )}

      {hint && !error && <div className="mt-1 text-xs text-gray-400">{hint}</div>}
      {error && (
        <div className="mt-1 flex items-center gap-1 text-xs text-danger-600">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
        </div>
      )}
    </div>
  );
}
