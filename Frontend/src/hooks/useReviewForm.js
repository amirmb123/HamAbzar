import { useState } from "react";
import { submitReview } from "../services/api";

/**
 * فرم ساده‌ی ثبت نظر — فقط ستاره (rating) و کامنت، مطابق دقیق با
 * ReviewCreateSerializer سمت بک‌اند که فقط همین دو فیلد رو قبول می‌کند.
 * @param {number} rentalId
 * @param {number|null} reviewedId - id طرف مقابل رزرو (owner یا borrower)
 */
export function useReviewForm(rentalId, reviewedId) {
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = overallRating > 0 && !!reviewedId;

  const submit = async () => {
    if (!canSubmit) return { success: false };
    setIsSubmitting(true);
    setError(null);
    try {
      await submitReview(rentalId, {
        reviewed_id: reviewedId,
        rating: overallRating,
        comment,
      });
      return { success: true };
    } catch (err) {
      setError(err.message || "خطا در ثبت نظر.");
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    overallRating,
    setOverallRating,
    comment,
    setComment,
    isSubmitting,
    canSubmit,
    error,
    submit,
  };
}
