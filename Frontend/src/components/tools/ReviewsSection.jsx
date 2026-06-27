import { toPersianDigits, formatRating } from "../../utils/format";

function getInitials(fullName) {
  const parts = fullName.trim().split(" ");
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : fullName.slice(0, 2);
}

function StarRow({ rating }) {
  return (
    <div className="mb-1.5 text-base text-amber-500">
      {"★".repeat(rating)}
      <span className="text-gray-200">{"★".repeat(5 - rating)}</span>
    </div>
  );
}

export default function ReviewsSection({ reviewsData, status }) {
  if (status === "loading") {
    return <div className="skeleton-shimmer h-40 rounded-lg" />;
  }
  if (status === "error" || !reviewsData) {
    return <p className="text-sm text-gray-500">نظرات قابل بارگذاری نبودن.</p>;
  }

  const { average_rating, total_count, breakdown, reviews } = reviewsData;

  return (
    <div>
      <div className="mb-2.5 mt-5 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">نظرات کاربران</h2>
        <span className="text-sm text-gray-500">{toPersianDigits(total_count)} نظر</span>
      </div>

      {/* خلاصه امتیاز */}
      <div className="mb-3.5 flex items-center gap-6 rounded-lg bg-gray-50 p-3.5">
        <div className="text-center">
          <div className="text-4xl font-medium text-gray-900">{formatRating(average_rating)}</div>
          <div className="mt-0.5 text-base text-amber-500">★★★★★</div>
          <div className="mt-1 text-[11px] text-gray-500">از ۵</div>
        </div>
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="mb-1 flex items-center gap-2">
              <span className="min-w-4 text-center text-[11px] text-gray-500">
                {toPersianDigits(star)}
              </span>
              <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${breakdown[star] ?? 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* لیست نظرات */}
      {reviews.map((review) => (
        <div key={review.id} className="mb-2.5 rounded-lg border border-gray-200 bg-white p-3.5">
          <div className="mb-2 flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
              {getInitials(review.reviewer_name)}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{review.reviewer_name}</div>
              <div className="text-xs text-gray-500">
                {new Date(review.created_at).toLocaleDateString("fa-IR")}
              </div>
            </div>
          </div>
          <StarRow rating={review.rating} />
          <p className="text-sm leading-6 text-gray-500">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
