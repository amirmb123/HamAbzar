import { useState } from "react";

export default function GalleryViewer({ images, isVerified }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="flex gap-2 border-b border-gray-200 bg-white p-4">
      {/* Thumbnails */}
      <div className="flex w-24 flex-col gap-2">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(idx)}
            className={`flex h-[92px] items-center justify-center overflow-hidden rounded-[10px] border bg-gray-50 transition ${
              idx === activeIndex ? "border-2 border-primary-600" : "border-gray-200"
            }`}
          >
            {img.image ? (
              <img src={img.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <i className="fa-solid fa-image text-2xl text-gray-500 opacity-50" />
            )}
          </button>
        ))}
      </div>

      {/* تصویر اصلی */}
      <div className="relative flex h-[300px] flex-1 items-center justify-center overflow-hidden rounded-lg bg-primary-50">
        {activeImage?.image ? (
          <img src={activeImage.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <i className="fa-solid fa-toolbox text-[64px] text-primary-600 opacity-25" />
        )}

        {isVerified && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600">
            <i className="fa-solid fa-check text-[11px]" /> تأیید شده
          </span>
        )}
      </div>
    </div>
  );
}
