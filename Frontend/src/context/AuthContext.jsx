// src/context/AuthContext.jsx
//
// وضعیت لاگین کاربر رو در کل اپ نگه می‌داره.
// هر کامپوننتی با useAuth() می‌تونه user رو بخونه یا logout کنه.

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosClient from "../services/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // null = نامشخص یا لاگ‌اوت
  const [loading, setLoading] = useState(true);   // تا وقتی /me چک نشده true هست

  // اولین بار که اپ لود میشه، اگه توکن داشتیم /me رو صدا میزنیم
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    axiosClient
      .get("/auth/me/")
      .then((res) => setUser(res.data.data))
      .catch(() => {
        // توکن منقضی یا نامعتبر — پاکش کن
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .finally(() => setLoading(false));
  }, []);

  // بعد از لاگین موفق، useAuthFlow این رو صدا میزنه
  const login = useCallback((userData, tokens) => {
    localStorage.setItem("access_token",  tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }, []);

  // بعد از ویرایش موفق پروفایل (PATCH /auth/me/)، یوزر کش‌شده در context رو به‌روز کن
  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth باید داخل AuthProvider استفاده شود");
  return ctx;
}