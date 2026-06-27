import { useState } from "react";
import { submitReview } from "../services/api";

export function useReviewForm(rentalId) {
  const [overallRating, setOverallRating] = useState(0);
  const [criteriaRatings, setCriteriaRatings] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const setCriterionRating = (key, value) => {
    setCriteriaRatings((prev) => ({ ...prev, [key]: value }));
  };

  const addPhoto = (url) => setPhotos((prev) => [...prev, url]);
  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const canSubmit = overallRating > 0;

  const submit = async () => {
    if (!canSubmit) return { success: false };
    setIsSubmitting(true);
    try {
      await submitReview(rentalId, {
        overall_rating: overallRating,
        criteria: criteriaRatings,
        tags: selectedTags,
        comment,
        photos,
        is_public: isPublic,
      });
      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    overallRating,
    setOverallRating,
    criteriaRatings,
    setCriterionRating,
    selectedTags,
    toggleTag,
    comment,
    setComment,
    photos,
    addPhoto,
    removePhoto,
    isPublic,
    setIsPublic,
    isSubmitting,
    canSubmit,
    submit,
  };
}
