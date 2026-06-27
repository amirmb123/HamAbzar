import { useEffect, useState, useCallback } from "react";
import { fetchMyRentals, fetchMyToolRentals } from "../services/api";

export function useMyRentals() {
  const [role, setRole] = useState("borrowed"); // borrowed | lent
  const [statusFilter, setStatusFilter] = useState(null);

  const [borrowedRentals, setBorrowedRentals] = useState([]);
  const [lentRentals, setLentRentals] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error

  const loadAll = useCallback(() => {
    setStatus("loading");
    Promise.all([fetchMyRentals(null), fetchMyToolRentals(null)])
      .then(([borrowed, lent]) => {
        setBorrowedRentals(borrowed);
        setLentRentals(lent);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const activeList = role === "borrowed" ? borrowedRentals : lentRentals;
  const filteredList = statusFilter ? activeList.filter((r) => r.status === statusFilter) : activeList;

  return {
    role,
    setRole,
    statusFilter,
    setStatusFilter,
    rentals: filteredList,
    borrowedCount: borrowedRentals.length,
    lentCount: lentRentals.length,
    status,
    refetch: loadAll,
  };
}
