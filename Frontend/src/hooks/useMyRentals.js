import { useEffect, useState, useCallback } from "react";
import {
  fetchMyRentals,
  fetchMyToolRentals,
  confirmRental,
  handoverRental,
  returnRental,
  cancelRental,
  createDispute,
} from "../services/api";

export function useMyRentals() {
  const [role, setRole] = useState("borrowed"); // borrowed | lent
  const [statusFilter, setStatusFilter] = useState(null);

  const [borrowedRentals, setBorrowedRentals] = useState([]);
  const [lentRentals, setLentRentals] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [actionError, setActionError] = useState(null);

  const loadAll = useCallback(() => {
    setStatus("loading");
    Promise.all([fetchMyRentals(), fetchMyToolRentals()])
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

  /** اجرای یک اکشن روی رزرو (confirm/cancel/handover/return) و رفرش لیست بعد از موفقیت */
  const runAction = useCallback(
    async (actionFn, rentalId) => {
      setActionError(null);
      try {
        await actionFn(rentalId);
        loadAll();
        return true;
      } catch (err) {
        setActionError(err.message || "خطایی رخ داد.");
        return false;
      }
    },
    [loadAll]
  );

  const confirm   = (rentalId) => runAction(confirmRental, rentalId);
  const handover  = (rentalId) => runAction(handoverRental, rentalId);
  const markReturned = (rentalId) => runAction(returnRental, rentalId);
  const cancel    = (rentalId) => runAction(cancelRental, rentalId);

  /** ثبت شکایت برای یک رزرو — خطا را به فرم پرتاب می‌کند تا داخل مودال نمایش داده شود */
  const fileDispute = useCallback(
    async (rentalId, reason) => {
      await createDispute(rentalId, reason);
      loadAll();
    },
    [loadAll]
  );

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
    actionError,
    confirm,
    handover,
    markReturned,
    cancel,
    fileDispute,
  };
}