// ─────────────────────────────────────────────────────────────
// api.js — لایه‌ی یکپارچه دسترسی به داده
//
// قانون مهم: هیچ کامپوننتی مستقیم از mockData.js ایمپورت نمی‌کنه.
// همه از طریق توابع همین فایل به داده دسترسی پیدا می‌کنن.
// وقتی بک‌اند Rental API و Tools API آماده شد، فقط بدنه‌ی هر
// تابع اینجا با فراخوانی axiosClient عوض می‌شه — امضای تابع
// (پارامترها و شکل خروجی) ثابت می‌مونه، پس کامپوننت‌ها دست
// نمی‌خورن.
// ─────────────────────────────────────────────────────────────

import axiosClient from "./axiosClient";

import {
  mockTools,
  mockCategories,
  mockCities,
  mockToolDetail,
  mockAvailability,
  mockAdminKpis,
  mockRentalTrend,
  mockPendingApprovals,
  mockAdminToolsQueue,
} from "./mockData";

// شبیه‌سازی تأخیر شبکه‌ی واقعی تا لودینگ/اسکلتون‌ها قابل تست باشن
const NETWORK_DELAY_MS = 450;
const delay = (ms = NETWORK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * مرکز تقریبی شهرها برای محاسبه موقعیت روی نقشه.
 * ⚠️ موقتی: mockData.js فعلاً lat/lng برای هر ابزار نداره.
 * وقتی بک‌اند فیلدهای latitude/longitude رو به مدل Tool اضافه کرد،
 * این بخش و تابع deriveCoordinates حذف می‌شن و کوردینیت مستقیم
 * از روی response خونده می‌شه.
 */
const CITY_CENTERS = {
  1: { lat: 35.6892, lng: 51.389 }, // تهران
  2: { lat: 32.6546, lng: 51.668 }, // اصفهان
  3: { lat: 36.2972, lng: 59.6067 }, // مشهد
  4: { lat: 29.5918, lng: 52.5837 }, // شیراز
  5: { lat: 38.0962, lng: 46.2738 }, // تبریز
};

/** ساخت کوردینیت تقریبی بر اساس مرکز شهر + distance_km + offset مبتنی بر id (برای پراکندگی پایدار) */
function deriveCoordinates(tool) {
  const center = CITY_CENTERS[tool.city?.id] || CITY_CENTERS[1];
  const angle = (tool.id * 47) % 360; // زاویه‌ی پایدار و قابل تکرار برای هر ابزار
  const radiusDeg = (tool.distance_km || 1) * 0.009; // تقریب: ۱ کیلومتر ≈ ۰.۰۰۹ درجه
  const rad = (angle * Math.PI) / 180;
  return {
    lat: center.lat + radiusDeg * Math.cos(rad),
    lng: center.lng + radiusDeg * Math.sin(rad),
  };
}

/**
 * GET /api/tools/
 * @param {Object} params - { category_id, city_id, search, min_price, max_price, ordering, page }
 * @returns {Promise<{count:number, next:string|null, previous:string|null, results:Array}>}
 */
export async function fetchTools(params = {}) {
  // ترجمه نام پارامترها به آنچه بک‌اند انتظار دارد
  const apiParams = {};
  if (params.category_id) apiParams.category = params.category_id;
  if (params.city_id)     apiParams.city     = params.city_id;
  if (params.search)      apiParams.search   = params.search;
  if (params.ordering)    apiParams.ordering = params.ordering;
  if (params.price_max)   apiParams.price_max = params.price_max;
  if (params.lat)         apiParams.lat      = params.lat;
  if (params.lng)         apiParams.lng      = params.lng;

  try {
    const res = await axiosClient.get("/tools/", { params: apiParams });
    // بک‌اند: { count, next, previous, results: [...] }
    const results = (res.data.results || []).map((t) => ({
      ...t,
      coordinates: t.latitude && t.longitude
        ? { lat: parseFloat(t.latitude), lng: parseFloat(t.longitude) }
        : deriveCoordinates(t),
    }));
    return { count: res.data.count, next: res.data.next, previous: res.data.previous, results };
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("server_error", "خطا در دریافت لیست ابزارها.");
  }
}

/**
 * GET /api/tools/<id>/
 *
 * اگر id == 1 باشه داده‌ی کامل mockToolDetail برگردانده می‌شه.
 * برای بقیه id ها، از mockTools یه detail واقعی ساخته می‌شه
 * تا همه‌ی آگهی‌ها قابل کلیک باشن (تا وقتی API واقعی وصل بشه).
 */
export async function fetchToolDetail(id) {
  try {
    const res = await axiosClient.get(`/tools/${id}/`);
    // بک‌اند: { status: "success", data: {...} }
    const tool = res.data.data;
    return {
      ...tool,
      coordinates: tool.latitude && tool.longitude
        ? { lat: parseFloat(tool.latitude), lng: parseFloat(tool.longitude) }
        : deriveCoordinates(tool),
    };
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    if (err.response.status === 404) throw new ApiError("not_found", "ابزار مورد نظر یافت نشد.");
    throw new ApiError("server_error", "خطا در دریافت اطلاعات ابزار.");
  }
}

/**
 * GET /api/tools/<id>/availability/?month=YYYY-MM
 * @param {number} id
 * @param {string} month
 */
export async function fetchToolAvailability(id, month) {
  try {
    const res = await axiosClient.get(`/tools/${id}/availability/`, {
      params: month ? { month } : {},
    });
    // بک‌اند: { status, data: { booked_dates: [...] } }
    return res.data.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    return { booked_dates: [] }; // در صورت خطا تقویم خالی نشون بده
  }
}

/** GET /api/tools/categories/ */
export async function fetchCategories() {
  try {
    const res = await axiosClient.get("/tools/categories/");
    // بک‌اند: { status, data: [...] }
    return res.data.data;
  } catch (err) {
    console.error("[fetchCategories] خطا در دریافت دسته‌بندی‌ها:", err);
    return []; // در صورت خطا لیست خالی
  }
}

/** GET /api/tools/cities/ */
export async function fetchCities() {
  try {
    const res = await axiosClient.get("/tools/cities/");
    return res.data.data;
  } catch (err) {
    console.error("[fetchCities] خطا در دریافت شهرها:", err);
    return [];
  }
}

/**
 * GET /api/tools/<id>/reviews/
 * بک‌اند فقط آرایه‌ی خام نظرات رو برمی‌گردونه (هر کدام: id, reviewer_name,
 * rating, comment, created_at) — بدون average_rating/breakdown/total_count.
 * این آماره‌ها رو همینجا از روی همون آرایه محاسبه می‌کنیم تا
 * ReviewsSection.jsx بدون تغییر شکل ورودی، همونطور که هست کار کنه.
 * @param {number} id
 */
export async function fetchToolReviews(id) {
  try {
    const res = await axiosClient.get(`/tools/${id}/reviews/`);
    const reviews = res.data.data || [];

    const total_count = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average_rating = total_count > 0 ? sum / total_count : 0;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (total_count > 0) {
      reviews.forEach((r) => {
        breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
      });
      for (const star of [1, 2, 3, 4, 5]) {
        breakdown[star] = Math.round((breakdown[star] / total_count) * 100);
      }
    }

    return { average_rating, total_count, breakdown, reviews };
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("server_error", "خطا در دریافت نظرات.");
  }
}

/**
 * GET /api/auth/me/
 * @returns {Promise<Object>} - { id, phone, username, full_name, email, wallet_balance, rating, avatar }
 */
export async function fetchMyProfile() {
  try {
    const res = await axiosClient.get("/auth/me/");
    return res.data.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("server_error", "خطا در دریافت اطلاعات پروفایل.");
  }
}

/**
 * PATCH /api/auth/me/
 * فیلدهای قابل ویرایش طبق UpdateProfileSerializer سمت بک‌اند: first_name, last_name, email, avatar
 * اگر avatar فایل باشد (instanceof File)، به‌صورت multipart/form-data ارسال می‌شود.
 * @param {Object} payload - { first_name, last_name, email, avatar? }
 */
export async function updateMyProfile(payload) {
  const hasFile = payload.avatar instanceof File;
  let body = payload;
  let headers;

  if (hasFile) {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, value);
    });
    body = form;
    headers = { "Content-Type": "multipart/form-data" };
  }

  try {
    const res = await axiosClient.patch("/auth/me/", body, headers ? { headers } : undefined);
    return res.data.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    const msg = err.response.data?.message;
    const firstErr = typeof msg === "object" ? Object.values(msg).flat()[0] : msg;
    throw new ApiError("bad_request", firstErr || "خطا در ویرایش پروفایل.");
  }
}

/**
 * GET /api/tools/my/
 * ابزارهایی که کاربر فعلی ثبت کرده — شامل ابزارهای غیرفعال/متوقف هم می‌شود
 * (برخلاف fetchTools که فقط ابزارهای is_available=true رو نشون می‌ده).
 * @returns {Promise<Array>}
 */
export async function fetchMyTools() {
  try {
    const res = await axiosClient.get("/tools/my/");
    return res.data.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("server_error", "خطا در دریافت ابزارهای ثبت‌شده.");
  }
}

/**
 * PATCH /api/tools/<id>/ — فقط برای تغییر وضعیت در دسترس بودن (توقف/فعال‌سازی آگهی)
 * @param {number} toolId
 * @param {boolean} isAvailable
 */
export async function setToolAvailability(toolId, isAvailable) {
  try {
    const res = await axiosClient.patch(`/tools/${toolId}/`, { is_available: isAvailable });
    return res.data.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("bad_request", err.response.data?.message || "خطا در تغییر وضعیت ابزار.");
  }
}

/**
 * DELETE /api/tools/<id>/ — حذف ابزار (فقط صاحب ابزار)
 * @param {number} toolId
 */
export async function deleteMyTool(toolId) {
  try {
    const res = await axiosClient.delete(`/tools/${toolId}/`);
    return res.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("bad_request", err.response.data?.message || "خطا در حذف ابزار.");
  }
}

export async function requestOtp(phone) {
  const fullPhone = phone.startsWith("0") ? phone : `0${phone}`;
  try {
    const res = await axiosClient.post("/auth/request-otp/", { phone: fullPhone });
    return res.data;
  } catch (err) {
    // خطای شبکه — سرور در دسترس نیست (ECONNREFUSED, Network Error, ...)
    if (!err.response) {
      throw new ApiError(
        "network_error",
        "اتصال به سرور ممکن نیست. لطفاً اینترنت یا آدرس سرور را بررسی کنید."
      );
    }
    // خطای rate limit
    if (err.response.status === 429) {
      const msg = err.response.data?.message || "لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید.";
      throw new ApiError("rate_limit", typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    const msg = err.response?.data?.message || "ارسال کد ناموفق بود.";
    throw new ApiError("bad_request", typeof msg === "string" ? msg : JSON.stringify(msg));
  }
}

export async function verifyOtp(phone, code) {
  const fullPhone = phone.startsWith("0") ? phone : `0${phone}`;
  try {
    const res = await axiosClient.post("/auth/verify-otp/", { phone: fullPhone, code });
    // res.data = { status, next: 'login'|'register', data: {...} }
    return res.data;
  } catch (err) {
    if (!err.response) {
      throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    }
    const msg = err.response?.data?.message || "کد اشتباه یا منقضی شده است.";
    throw new ApiError("bad_request", typeof msg === "string" ? msg : JSON.stringify(msg));
  }
}

export async function registerUser(payload) {
  // payload = { temp_token, first_name, last_name, username, password, password2, email? }
  try {
    const res = await axiosClient.post("/auth/register/", payload);
    return res.data;
  } catch (err) {
    if (!err.response) {
      throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    }
    const data = err.response?.data;
    // اگر message یه object بود (validation errors)، اولین خطا رو نشون بده
    let msg = "خطا در ثبت‌نام.";
    if (typeof data?.message === "string") {
      msg = data.message;
    } else if (typeof data?.message === "object") {
      // مثلاً { username: ["این نام کاربری قبلاً استفاده شده"] }
      const firstKey = Object.keys(data.message)[0];
      const firstVal = data.message[firstKey];
      msg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
    }
    throw new ApiError("bad_request", msg);
  }
}

/**
 * GET /api/rentals/my/
 * بک‌اند فعلاً فیلتر status رو در query قبول نمی‌کنه؛ فیلتر سمت کلاینت
 * در useMyRentals انجام می‌شه (statusFilter همچنان به همون شکل کار می‌کنه).
 * @returns {Promise<Array>} - هر رزرو: { id, tool, borrower, start_date, end_date, total_price, deposit_held, status, created_at }
 */
export async function fetchMyRentals() {
  try {
    const res = await axiosClient.get("/rentals/my/");
    // بک‌اند: { status: "success", data: [...] }
    return res.data.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("server_error", "خطا در دریافت لیست رزروها.");
  }
}

/**
 * GET /api/rentals/<id>/
 * جزئیات کامل یک رزرو — برخلاف fetchMyRentals/fetchMyToolRentals (که فقط
 * snapshot ابزار/borrower رو دارن)، اینجا owner هم برمی‌گرده. برای فرم
 * ثبت نظر لازم است چون باید id طرف مقابل (reviewed_id) رو بدونیم.
 * @param {number} rentalId
 */
export async function fetchRentalDetail(rentalId) {
  try {
    const res = await axiosClient.get(`/rentals/${rentalId}/`);
    return res.data.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    if (err.response.status === 404) throw new ApiError("not_found", "رزرو پیدا نشد.");
    throw new ApiError("server_error", "خطا در دریافت اطلاعات رزرو.");
  }
}

/**
 * GET /api/rentals/my-tools/
 * @returns {Promise<Array>}
 */
export async function fetchMyToolRentals() {
  try {
    const res = await axiosClient.get("/rentals/my-tools/");
    return res.data.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("server_error", "خطا در دریافت لیست ابزارهای اجاره‌رفته.");
  }
}

/** POST /api/rentals/<id>/confirm/ — تأیید رزرو (فقط صاحب ابزار) */
export async function confirmRental(rentalId) {
  try {
    const res = await axiosClient.post(`/rentals/${rentalId}/confirm/`);
    return res.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("bad_request", err.response.data?.message || "خطا در تأیید رزرو.");
  }
}

/** POST /api/rentals/<id>/handover/ — ثبت تحویل ابزار (فقط صاحب ابزار) */
export async function handoverRental(rentalId) {
  try {
    const res = await axiosClient.post(`/rentals/${rentalId}/handover/`);
    return res.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("bad_request", err.response.data?.message || "خطا در ثبت تحویل.");
  }
}

/** POST /api/rentals/<id>/return/ — ثبت بازگشت ابزار (فقط صاحب ابزار) */
export async function returnRental(rentalId) {
  try {
    const res = await axiosClient.post(`/rentals/${rentalId}/return/`);
    return res.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("bad_request", err.response.data?.message || "خطا در ثبت بازگشت.");
  }
}

/** POST /api/rentals/<id>/cancel/ — لغو رزرو (صاحب یا اجاره‌گیرنده، فقط در وضعیت pending) */
export async function cancelRental(rentalId) {
  try {
    const res = await axiosClient.post(`/rentals/${rentalId}/cancel/`);
    return res.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("bad_request", err.response.data?.message || "خطا در لغو رزرو.");
  }
}

/**
 * GET /api/rentals/<id>/messages/
 * بک‌اند مفهوم «لیست گفتگوها» ندارد — هر چت فقط مال یک رزرو خاص است.
 * این endpoint با polling هر ۵ ثانیه صدا زده می‌شود (طبق طراحی بک‌اند).
 * @param {number} rentalId
 * @returns {Promise<Array>} - هر پیام: { id, sender_name, content, is_read, created_at }
 */
export async function fetchRentalMessages(rentalId) {
  try {
    const res = await axiosClient.get(`/rentals/${rentalId}/messages/`);
    return res.data.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("server_error", "خطا در دریافت پیام‌ها.");
  }
}

/**
 * POST /api/rentals/<id>/messages/
 * @param {number} rentalId
 * @param {string} content
 * @returns {Promise<Object>} - پیام ثبت‌شده: { id, sender_name, content, is_read, created_at }
 */
export async function sendRentalMessage(rentalId, content) {
  try {
    const res = await axiosClient.post(`/rentals/${rentalId}/messages/`, { content });
    return res.data.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    throw new ApiError("bad_request", err.response.data?.message || "ارسال پیام ناموفق بود.");
  }
}

/**
 * POST /api/rentals/<rental_id>/review/
 * بک‌اند فقط rating و comment رو قبول می‌کند (ReviewCreateSerializer).
 * reviewed_id باید id طرف مقابل رزرو باشد (owner یا borrower، بسته به نقش کاربر فعلی).
 * @param {number} rentalId
 * @param {Object} payload - { reviewed_id, rating, comment }
 */
export async function submitReview(rentalId, payload) {
  try {
    const res = await axiosClient.post(`/rentals/${rentalId}/review/`, payload);
    return res.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    const msg = err.response.data?.message;
    const firstErr = typeof msg === "object" ? Object.values(msg).flat()[0] : msg;
    throw new ApiError("bad_request", firstErr || "خطا در ثبت نظر.");
  }
}

/**
 * POST /api/tools/
 * مطابق ToolWriteSerializer سمت بک‌اند:
 * @param {Object} payload - { category, city, name, description,
 *   daily_price, deposit_amount, latitude, longitude, address, images }
 */
export async function createTool(payload) {
  // مرحله ۱: ثبت ابزار (بدون تصویر)
  const toolPayload = {
    name:           payload.name,
    description:    payload.description,
    category:       payload.category,
    city:           payload.city,
    daily_price:    payload.daily_price,
    deposit_amount: payload.deposit_amount || 0,
    latitude:       payload.latitude,
    longitude:      payload.longitude,
    address:        payload.address || "",
  };

  let toolRes;
  try {
    toolRes = await axiosClient.post("/tools/", toolPayload);
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    const msg = err.response?.data?.message;
    const firstErr = typeof msg === "object" ? Object.values(msg).flat()[0] : msg;
    throw new ApiError("bad_request", firstErr || "خطا در ثبت ابزار.");
  }

  const toolId = toolRes.data.data.id;

  // مرحله ۲: آپلود تصاویر (اگر وجود داشت)
  if (payload.images && payload.images.length > 0) {
    for (const file of payload.images) {
      if (!(file instanceof File)) continue;
      const form = new FormData();
      form.append("image", file);
      try {
        await axiosClient.post(`/tools/${toolId}/images/`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (e) {
        console.warn("[createTool] آپلود تصویر ناموفق:", e);
      }
    }
  }

  return { status: "success", data: { id: toolId } };
}

/**
 * GET /api/admin/dashboard/
 * ⚠️ این endpoint فقط برای نقش ادمین معنا دارد. در نبود سیستم نقش
 * واقعی (mockCurrentUser فعلی هیچ role ندارد)، این تابع بدون احراز
 * هویت همیشه پاسخ می‌دهد — وقتی نقش/مجوز ادمین در بک‌اند پیاده شد،
 * این تابع باید 403 برای کاربر غیرادمین برگرداند.
 */
export async function fetchAdminDashboard() {
  await delay(350);
  return {
    kpis: mockAdminKpis,
    rental_trend: mockRentalTrend,
    pending_approvals: mockPendingApprovals,
  };
}

/**
 * GET /api/admin/tools/?status=...
 * ⚠️ این آرایه‌ی mock به‌صورت محلی (در حافظه) mutate می‌شود تا
 * تأیید/رد/حذف در طول یک session رفتار واقعی داشته باشد. با رفرش
 * صفحه به حالت اولیه برمی‌گردد چون پایداری واقعی نداریم.
 */
export async function fetchAdminToolsQueue(statusFilter = null) {
  await delay(300);
  if (!statusFilter || statusFilter === "all") return [...mockAdminToolsQueue];
  return mockAdminToolsQueue.filter((t) => t.review_status === statusFilter);
}

/** POST /api/admin/tools/<id>/approve/ */
export async function approveAdminTool(toolId) {
  await delay(300);
  const tool = mockAdminToolsQueue.find((t) => t.id === toolId);
  if (tool) tool.review_status = "approved";
  return { status: "success" };
}

/** POST /api/admin/tools/<id>/reject/ */
export async function rejectAdminTool(toolId, reason) {
  await delay(300);
  const tool = mockAdminToolsQueue.find((t) => t.id === toolId);
  if (tool) {
    tool.review_status = "rejected";
    tool.rejection_reason = reason;
  }
  return { status: "success" };
}

/** DELETE /api/admin/tools/<id>/ */
export async function deleteAdminTool(toolId) {
  await delay(300);
  const idx = mockAdminToolsQueue.findIndex((t) => t.id === toolId);
  if (idx !== -1) mockAdminToolsQueue.splice(idx, 1);
  return { status: "success" };
}

/**
 * POST /api/rentals/
 * @param {Object} payload - { tool_id, start_date, end_date } — تاریخ‌ها به فرمت YYYY-MM-DD
 * @returns {Promise<Object>} - { status: "success", data: RentalDetail }
 */
export async function createRental(payload) {
  try {
    const res = await axiosClient.post("/rentals/", payload);
    return res.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    if (err.response.status === 409) {
      throw new ApiError("date_conflict", err.response.data?.message || "این ابزار برای تاریخ‌های انتخاب‌شده رزرو شده است.");
    }
    const msg = err.response.data?.message;
    const firstErr = typeof msg === "object" ? Object.values(msg).flat()[0] : msg;
    throw new ApiError("bad_request", firstErr || "خطا در ثبت رزرو.");
  }
}
/**
 * POST /api/rentals/<id>/dispute/ — ثبت شکایت برای یک رزرو
 * فقط طرفین رزرو (صاحب یا اجاره‌گیرنده) و فقط در وضعیت active/returned مجاز است.
 * هر رزرو فقط یک شکایت می‌تواند داشته باشد (در صورت تکرار، بک‌اند ۴۰۹ برمی‌گرداند).
 * @param {number} rentalId
 * @param {string} reason - حداقل ۱۰ و حداکثر ۲۰۰۰ کاراکتر
 */
export async function createDispute(rentalId, reason) {
  try {
    const res = await axiosClient.post(`/rentals/${rentalId}/dispute/`, { reason });
    return res.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    if (err.response.status === 409) {
      throw new ApiError("conflict", err.response.data?.message || "برای این رزرو قبلاً شکایت ثبت شده است.");
    }
    const msg = err.response.data?.message;
    const firstErr = typeof msg === "object" ? Object.values(msg).flat()[0] : msg;
    throw new ApiError("bad_request", firstErr || "خطا در ثبت شکایت.");
  }
}

/**
 * GET /api/disputes/?status=... — لیست همه‌ی شکایت‌ها (فقط ادمین)
 * @param {string|null} statusFilter - 'open' | 'under_review' | 'resolved' | null (همه)
 * @returns {Promise<Array>}
 */
export async function fetchDisputes(statusFilter = null) {
  try {
    const res = await axiosClient.get("/disputes/", {
      params: statusFilter ? { status: statusFilter } : {},
    });
    // بک‌اند: { status: "success", results: [...] }
    return res.data.results;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    if (err.response.status === 403) {
      throw new ApiError("forbidden", "دسترسی ادمین لازم است.");
    }
    throw new ApiError("server_error", "خطا در دریافت لیست شکایت‌ها.");
  }
}

/**
 * PATCH /api/disputes/<id>/resolve/ — رسیدگی و بستن شکایت (فقط ادمین)
 * @param {number} disputeId
 * @param {Object} payload - { resolution, penalty_amount }
 */
export async function resolveDispute(disputeId, payload) {
  try {
    const res = await axiosClient.patch(`/disputes/${disputeId}/resolve/`, payload);
    return res.data;
  } catch (err) {
    if (!err.response) throw new ApiError("network_error", "اتصال به سرور ممکن نیست.");
    if (err.response.status === 403) {
      throw new ApiError("forbidden", "دسترسی ادمین لازم است.");
    }
    const msg = err.response.data?.message;
    const firstErr = typeof msg === "object" ? Object.values(msg).flat()[0] : msg;
    throw new ApiError("bad_request", firstErr || "خطا در رسیدگی به شکایت.");
  }
}

export class ApiError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }
}3