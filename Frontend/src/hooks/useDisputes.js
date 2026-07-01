import { useEffect, useState, useCallback } from "react";
import { fetchDisputes, resolveDispute } from "../services/api";

/**
 * مدیریت لیست شکایت‌ها برای پنل ادمین.
 * مثل useAdminToolsQueue: همه‌ی شکایت‌ها یک‌جا گرفته می‌شوند (بدون فیلتر status)
 * و فیلتر تب‌ها سمت کلاینت انجام می‌شود تا شمارش هر تب همیشه دقیق باشد.
 */
export function useDisputes() {
  const [allDisputes, setAllDisputes] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all | open | under_review | resolved
  const [status, setStatus] = useState("loading"); // loading | success | error | forbidden
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(() => {
    setStatus("loading");
    setErrorMessage(null);
    fetchDisputes(null)
      .then((data) => {
        setAllDisputes(data);
        setStatus("success");
      })
      .catch((err) => {
        setStatus(err.type === "forbidden" ? "forbidden" : "error");
        setErrorMessage(err.message);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = {
    all: allDisputes.length,
    open: allDisputes.filter((d) => d.status === "open").length,
    under_review: allDisputes.filter((d) => d.status === "under_review").length,
    resolved: allDisputes.filter((d) => d.status === "resolved").length,
  };

  const filteredDisputes =
    activeTab === "all" ? allDisputes : allDisputes.filter((d) => d.status === activeTab);

  const resolve = useCallback(
    async (disputeId, payload) => {
      await resolveDispute(disputeId, payload);
      load();
    },
    [load]
  );

  return {
    disputes: filteredDisputes,
    counts,
    activeTab,
    setActiveTab,
    status,
    errorMessage,
    resolve,
    refetch: load,
  };
}
