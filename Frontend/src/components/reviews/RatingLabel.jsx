import { toPersianDigits } from "../../utils/format";

const RATING_LABELS = {
  5: "عالی",
  4: "خوب",
  3: "متوسط",
  2: "ضعیف",
  1: "بسیار ضعیف",
};

export default function RatingLabel({ rating }) {
  if (!rating) {
    return <div className="mb-6 text-center text-sm text-gray-400">امتیاز خود را انتخاب کنید</div>;
  }
  return (
    <div className="mb-6 text-center text-sm font-semibold text-primary-600">
      {RATING_LABELS[rating]} — {toPersianDigits(rating)} از ۵
    </div>
  );
}
