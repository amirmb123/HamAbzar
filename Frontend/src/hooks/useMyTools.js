import { useEffect, useState, useCallback } from "react";
import { fetchMyTools, setToolAvailability, deleteMyTool } from "../services/api";

export function useMyTools() {
  const [tools, setTools] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [actionError, setActionError] = useState(null);
  // toolId در حال انجام یک اکشن (toggle/delete) — برای غیرفعال کردن دکمه‌ها روی همان کارت
  const [pendingId, setPendingId] = useState(null);

  const load = useCallback(() => {
    setStatus("loading");
    fetchMyTools()
      .then((data) => {
        setTools(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** فعال/متوقف کردن آگهی — به‌صورت optimistic روی state محلی هم اعمال می‌شود */
  const toggleAvailability = useCallback(
    async (tool) => {
      setActionError(null);
      setPendingId(tool.id);
      try {
        const updated = await setToolAvailability(tool.id, !tool.is_available);
        setTools((prev) =>
          prev.map((t) => (t.id === tool.id ? { ...t, is_available: updated.is_available } : t))
        );
        return true;
      } catch (err) {
        setActionError(err.message || "خطایی رخ داد.");
        return false;
      } finally {
        setPendingId(null);
      }
    },
    []
  );

  /** حذف ابزار — بعد از موفقیت از لیست محلی هم حذف می‌شود */
  const removeTool = useCallback(async (toolId) => {
    setActionError(null);
    setPendingId(toolId);
    try {
      await deleteMyTool(toolId);
      setTools((prev) => prev.filter((t) => t.id !== toolId));
      return true;
    } catch (err) {
      setActionError(err.message || "خطایی رخ داد.");
      return false;
    } finally {
      setPendingId(null);
    }
  }, []);

  return {
    tools,
    status,
    refetch: load,
    actionError,
    pendingId,
    toggleAvailability,
    removeTool,
  };
}
