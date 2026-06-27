export default function SpecsInputList({ specs, onUpdate, onAdd, onRemove }) {
  return (
    <div>
      {specs.map((spec, idx) => (
        <div key={idx} className="mb-2 flex gap-2">
          <input
            type="text"
            value={spec.label}
            onChange={(e) => onUpdate(idx, "label", e.target.value)}
            placeholder="مثال: توان"
            className="w-2/5 rounded-md border border-gray-200 px-3.5 py-2.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(26,107,74,.1)]"
          />
          <input
            type="text"
            value={spec.value}
            onChange={(e) => onUpdate(idx, "value", e.target.value)}
            placeholder="مثال: ۷۵۰ وات"
            className="flex-1 rounded-md border border-gray-200 px-3.5 py-2.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(26,107,74,.1)]"
          />
          {specs.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-400 transition hover:border-danger-600 hover:text-danger-600"
            >
              <i className="fa-solid fa-trash text-sm" />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-primary-600"
      >
        <i className="fa-solid fa-plus" />
        افزودن مشخصه دیگر
      </button>
    </div>
  );
}
