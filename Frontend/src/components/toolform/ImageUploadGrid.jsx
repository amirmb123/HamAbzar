import { toPersianDigits } from "../../utils/format";

const MAX_IMAGES = 8;

export default function ImageUploadGrid({ images, onAdd, onRemove, minImages = 3 }) {
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // فعلاً فقط preview محلی — وقتی Tools API وصل شد باید آپلود واقعی به سرور انجام شه
      onAdd(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <div className="mb-2 grid grid-cols-4 gap-3 sm:grid-cols-3">
        {images.map((imageUrl, idx) => (
          <div
            key={idx}
            className="relative aspect-square overflow-hidden rounded-lg border-[1.5px] border-gray-200 bg-gray-100"
          >
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute left-1.5 top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-black/55 text-[11px] text-white"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            {idx === 0 && (
              <div className="absolute bottom-1.5 left-1.5 right-1.5 rounded-sm bg-primary-600 py-0.5 text-center text-[10px] text-white">
                تصویر اصلی
              </div>
            )}
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-gray-200 bg-gray-50 text-gray-400 transition hover:border-primary-600 hover:bg-primary-50 hover:text-primary-600">
            <i className="fa-solid fa-camera text-xl" />
            <span className="text-xs">افزودن عکس</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </label>
        )}
      </div>

      <div className="text-xs text-gray-400">
        حداقل {toPersianDigits(minImages)} تصویر — اولین تصویر به‌عنوان تصویر اصلی نمایش داده می‌شود
      </div>
    </div>
  );
}
