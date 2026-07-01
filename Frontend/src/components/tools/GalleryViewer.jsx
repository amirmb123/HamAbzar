import { useState } from "react";

export default function GalleryViewer({ images, isVerified }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col gap-2 border-b border-gray-200 bg-white p-3 sm:p-4 md:flex-row">
      {/* تصویر اصلی */}
      <div className="relative order-1 flex h-[220px] flex-1 items-center justify-center overflow-hidden rounded-lg bg-primary-50 sm:h-[260px] md:order-2 md:h-[300px]">
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

      {/* Thumbnails */}
      <div className="no-scrollbar order-2 flex shrink-0 gap-2 overflow-x-auto md:order-1 md:w-24 md:flex-col md:overflow-x-visible">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(idx)}
            className={`flex h-[70px] w-[70px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border bg-gray-50 transition md:h-[92px] md:w-full ${
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
    </div>
  );
}
