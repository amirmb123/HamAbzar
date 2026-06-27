import axios from "axios";

// آدرس پایه API — از .env می‌خونیم تا بین محیط dev/production فرق کنه
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// اضافه کردن JWT access token به هدر هر درخواست (وقتی auth واقعی وصل شد)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
