const MAX_PHOTOS = 4;

export default function PhotoUploadRow({ photos, onAdd, onRemove }) {
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // فعلاً فقط preview محلی — وقتی API واقعی وصل شد باید آپلود به سرور انجام شه
      onAdd(URL.createObjectURL(file));
    }
  };

  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-gray-900">افزودن عکس (اختیاری)</label>
      <div className="flex gap-2">
        {photos.map((photoUrl, idx) => (
          <div key={idx} className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md">
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => onRemove(idx)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] text-white"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <label className="flex h-[72px] w-[72px] shrink-0 cursor-pointer items-center justify-center rounded-md border-[1.5px] border-dashed border-gray-200 text-gray-400 transition hover:border-primary-600 hover:text-primary-600">
            <i className="fa-solid fa-camera text-lg" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </label>
        )}
      </div>
    </div>
  );
}
