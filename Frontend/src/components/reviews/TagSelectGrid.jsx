export default function TagSelectGrid({ tags, selectedTags, onToggle }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-sm transition ${
              isSelected
                ? "border-primary-600 bg-primary-50 font-medium text-primary-600"
                : "border-gray-200 text-gray-500 hover:border-primary-100"
            }`}
          >
            {isSelected && <i className="fa-solid fa-check text-[11px]" />}
            {tag}
          </button>
        );
      })}
    </div>
  );
}
