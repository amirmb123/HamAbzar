import axios from "axios";

// آدرس پایه API
// اگر VITE_API_BASE_URL در .env تنظیم شده باشه از اون استفاده می‌کنه
// وگرنه از همان host که فرانت رویش باز شده به پورت 8000 وصل میشه
// این یعنی وقتی از گوشی با IP 192.168.x.x:5173 باز میشه،
// به 192.168.x.x:8000 وصل میشه — نه localhost که گوشی نمیشناسه!
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:8000/api`;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// اضافه کردن JWT access token به هدر هر درخواست
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// مدیریت خطاهای احراز هویت — اگر توکن منقضی شد به صفحه لاگین بفرست
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // اگر الان روی صفحه‌ای غیر از auth هستیم، ریدایرکت کن
      if (!window.location.pathname.includes("/auth")) {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;