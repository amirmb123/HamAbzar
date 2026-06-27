import { toPersianDigits, formatRating } from "../../utils/format";

function getInitials(fullName) {
  const parts = fullName.trim().split(" ");
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : fullName.slice(0, 2);
}

export default function OwnerCard({ owner, onChatClick }) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3.5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-medium text-primary-700">
        {getInitials(owner.full_name)}
      </div>

      <div className="flex-1">
        <div className="text-md font-medium text-gray-900">{owner.full_name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-star text-[12px] text-amber-500" />
            {formatRating(owner.rating)} امتیاز
          </span>
          {typeof owner.successful_rentals === "number" && (
            <>
              <span>·</span>
              <span>{toPersianDigits(owner.successful_rentals)} اجاره موفق</span>
            </>
          )}
          {owner.member_since_year && (
            <>
              <span>·</span>
              <span>عضو از {toPersianDigits(owner.member_since_year)}</span>
            </>
          )}
        </div>
      </div>

      <button
        onClick={onChatClick}
        className="flex items-center gap-1.5 rounded-md border border-primary-600 px-3.5 py-1.5 text-xs text-primary-600 transition hover:bg-primary-50"
      >
        <i className="fa-regular fa-comment" />
        چت
      </button>
    </div>
  );
}
