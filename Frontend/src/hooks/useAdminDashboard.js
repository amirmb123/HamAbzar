import { useEffect, useState } from "react";
import { fetchAdminDashboard } from "../services/api";

export function useAdminDashboard() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchAdminDashboard()
      .then((result) => {
        setData(result);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  return { data, status };
}
