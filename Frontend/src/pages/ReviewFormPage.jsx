import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useReviewForm } from "../hooks/useReviewForm";
import { fetchRentalDetail } from "../services/api";
import { useAuth } from "../context/AuthContext";

import Button from "../components/common/Button";
import RentalRecap from "../components/reviews/RentalRecap";
import StarRatingInput from "../components/reviews/StarRatingInput";
import RatingLabel from "../components/reviews/RatingLabel";
import CommentTextarea from "../components/reviews/CommentTextarea";
import { toJalali, formatJalaliMonthLabel } from "../utils/jalali";
import { toPersianDigits } from "../utils/format";

function formatDateRangeLabel(startIso, endIso) {
  const start = toJalali(startIso);
  const end = toJalali(endIso);
  const startMonth = formatJalaliMonthLabel(start.jy, start.jm).split(" ")[0];
  const endMonth = formatJalaliMonthLabel(end.jy, end.jm).split(" ")[0];
  const endYear = formatJalaliMonthLabel(end.jy, end.jm).split(" ")[1];
  if (startMonth === endMonth) {
    return `${toPersianDigits(start.jd)} تا ${toPersianDigits(end.jd)} ${endMonth} ${endYear}`;
  }
  return `${toPersianDigits(start.jd)} ${startMonth} تا ${toPersianDigits(end.jd)} ${endMonth} ${endYear}`;
}

export default function ReviewFormPage() {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rental, setRental] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");

  useEffect(() => {
    fetchRentalDetail(rentalId)
      .then((data) => {
        setRental(data);
        setLoadStatus("success");
      })
      .catch(() => setLoadStatus("error"));
  }, [rentalId]);

  // طرف مقابل رزرو: اگه کاربر فعلی اجاره‌گیرنده است، طرف مقابل صاحب ابزاره و برعکس.
  const counterparty =
    rental && user
      ? user.id === rental.borrower.id
        ? rental.owner
        : rental.borrower
      : null;

  const {
    overallRating,
    setOverallRating,
    comment,
    setComment,
    isSubmitting,
    canSubmit,
    error,
    submit,
  } = useReviewForm(rentalId, counterparty?.id);

  const handleSubmit = async () => {
    const result = await submit();
    if (result.success) {
      navigate("/my-rentals");
    }
  };

  if (loadStatus === "loading") {
    return <div className="flex h-screen items-center justify-center text-gray-500">در حال بارگذاری...</div>;
  }

  if (loadStatus === "error" || !rental || !counterparty) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-gray-500">
        <p>این رزرو پیدا نشد یا قابل نظر دادن نیست.</p>
        <Link to="/my-rentals">
          <Button variant="outline">بازگشت به کرایه‌های من</Button>
        </Link>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-md bg-primary-600 text-white">
            <i className="fa-solid fa-screwdriver-wrench" />
          </div>
          هم‌ابزار
        </div>
        <span className="text-md font-semibold text-gray-900">ثبت امتیاز و نظر</span>
        <Link
          to="/my-rentals"
          className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
        >
          رد کردن
          <i className="fa-solid fa-xmark" />
        </Link>
      </header>

      <div className="mx-auto max-w-[600px] px-6 py-8">
        <RentalRecap
          toolName={rental.tool.name}
          ownerName={counterparty.full_name}
          dateRangeLabel={formatDateRangeLabel(rental.start_date, rental.end_date)}
        />

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h1 className="mb-2 text-center text-xl font-bold text-gray-900">تجربه اجاره شما چطور بود؟</h1>
          <p className="mb-6 text-center text-base text-gray-500">
            نظر شما به سایر کاربران در انتخاب بهتر کمک می‌کند
          </p>

          <StarRatingInput value={overallRating} onChange={setOverallRating} size="big" />
          <RatingLabel rating={overallRating} />

          <div className="my-6 h-px bg-gray-100" />

          <CommentTextarea value={comment} onChange={setComment} />

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Link to="/my-rentals" className="flex-1">
              <Button variant="outline" size="lg" full>
                رد کردن
              </Button>
            </Link>
            <Button
              size="lg"
              full
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
              className="flex-1"
            >
              {isSubmitting ? "در حال ثبت..." : "ثبت نظر"}
              {!isSubmitting && <i className="fa-solid fa-check" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
