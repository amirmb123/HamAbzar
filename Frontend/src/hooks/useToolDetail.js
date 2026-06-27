import { useEffect, useState } from "react";
import {
  fetchToolDetail,
  fetchToolAvailability,
  fetchToolReviews,
  fetchRelatedTools,
} from "../services/api";

export function useToolDetail(toolId) {
  const [tool, setTool] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [reviewsData, setReviewsData] = useState(null);
  const [relatedTools, setRelatedTools] = useState([]);

  const [toolStatus, setToolStatus] = useState("loading"); // loading | success | error
  const [reviewsStatus, setReviewsStatus] = useState("loading");
  const [relatedStatus, setRelatedStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    setToolStatus("loading");
    fetchToolDetail(toolId)
      .then((data) => {
        if (cancelled) return;
        setTool(data);
        setToolStatus("success");
        return fetchToolAvailability(toolId);
      })
      .then((availability) => {
        if (cancelled || !availability) return;
        setBookedDates(availability.booked_dates);
      })
      .catch(() => {
        if (!cancelled) setToolStatus("error");
      });

    setReviewsStatus("loading");
    fetchToolReviews(toolId)
      .then((data) => {
        if (cancelled) return;
        setReviewsData(data);
        setReviewsStatus("success");
      })
      .catch(() => {
        if (!cancelled) setReviewsStatus("error");
      });

    setRelatedStatus("loading");
    fetchRelatedTools(toolId)
      .then((data) => {
        if (cancelled) return;
        setRelatedTools(data);
        setRelatedStatus("success");
      })
      .catch(() => {
        if (!cancelled) setRelatedStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [toolId]);

  return {
    tool,
    toolStatus,
    bookedDates,
    reviewsData,
    reviewsStatus,
    relatedTools,
    relatedStatus,
  };
}
