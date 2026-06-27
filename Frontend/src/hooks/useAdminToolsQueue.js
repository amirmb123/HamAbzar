import { useEffect, useState, useCallback } from "react";
import { fetchAdminToolsQueue, approveAdminTool, rejectAdminTool, deleteAdminTool } from "../services/api";

export function useAdminToolsQueue() {
  const [allTools, setAllTools] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [status, setStatus] = useState("loading");

  const load = useCallback(() => {
    setStatus("loading");
    fetchAdminToolsQueue(null)
      .then((data) => {
        setAllTools(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = {
    all: allTools.length,
    pending: allTools.filter((t) => t.review_status === "pending").length,
    approved: allTools.filter((t) => t.review_status === "approved").length,
    rejected: allTools.filter((t) => t.review_status === "rejected").length,
  };

  const filteredTools = activeTab === "all" ? allTools : allTools.filter((t) => t.review_status === activeTab);

  const handleApprove = async (tool) => {
    await approveAdminTool(tool.id);
    setAllTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, review_status: "approved" } : t)));
  };

  const handleReject = async (tool, reason) => {
    await rejectAdminTool(tool.id, reason);
    setAllTools((prev) =>
      prev.map((t) => (t.id === tool.id ? { ...t, review_status: "rejected", rejection_reason: reason } : t))
    );
  };

  const handleDelete = async (tool) => {
    await deleteAdminTool(tool.id);
    setAllTools((prev) => prev.filter((t) => t.id !== tool.id));
  };

  return {
    tools: filteredTools,
    counts,
    activeTab,
    setActiveTab,
    status,
    handleApprove,
    handleReject,
    handleDelete,
    refetch: load,
  };
}
