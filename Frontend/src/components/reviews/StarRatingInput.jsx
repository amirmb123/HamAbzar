const SIZE_CLASSES = {
  big: "text-[38px]",
  mini: "text-[19px]",
};

export default function StarRatingInput({ value, onChange, size = "big" }) {
  return (
    <div className="flex justify-center gap-2" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`${SIZE_CLASSES[size]} cursor-pointer transition ${
            star <= value ? "text-amber-500" : "text-gray-200"
          }`}
        >
          <i className={star <= value ? "fa-solid fa-star" : "fa-regular fa-star"} />
        </button>
      ))}
    </div>
  );
}
