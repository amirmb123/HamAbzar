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
  mockToolReviews,
  mockRelatedTools,
  mockMyRentals,
  mockMyToolRentals,
  mockConversations,
  mockConversationMessages,
  mockReviewTags,
  TOOL_CONDITIONS,
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
  await delay();

  let results = [...mockTools.results];

  if (params.category_id) {
    results = results.filter((t) => t.category.id === Number(params.category_id));
  }
  if (params.city_id) {
    results = results.filter((t) => t.city.id === Number(params.city_id));
  }
  if (params.search) {
    const q = params.search.trim().toLowerCase();
    results = results.filter((t) => t.name.toLowerCase().includes(q));
  }
  if (params.only_available) {
    results = results.filter((t) => t.is_available);
  }

  switch (params.ordering) {
    case "price_asc":
      results.sort((a, b) => a.daily_price - b.daily_price);
      break;
    case "price_desc":
      results.sort((a, b) => b.daily_price - a.daily_price);
      break;
    case "rating":
      results.sort((a, b) => b.owner.rating - a.owner.rating);
      break;
    case "distance":
      results.sort((a, b) => a.distance_km - b.distance_km);
      break;
    default:
      break; // جدیدترین: همون ترتیب پیش‌فرض mock
  }

  // اضافه کردن کوردینیت موقت برای نقشه (توضیح بالا)
  results = results.map((t) => ({ ...t, coordinates: deriveCoordinates(t) }));

  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  };
}

/**
 * GET /api/tools/<id>/
 * @param {number} id
 */
export async function fetchToolDetail(id) {
  await delay();
  if (Number(id) !== mockToolDetail.data.id) {
    throw new ApiError("not_found", "مورد مورد نظر یافت نشد.");
  }
  return mockToolDetail.data;
}

/**
 * GET /api/tools/<id>/availability/?month=YYYY-MM
 * @param {number} id
 * @param {string} month
 */
export async function fetchToolAvailability(id, month) {
  await delay(250);
  return mockAvailability.data;
}

/** GET /api/categories/ */
export async function fetchCategories() {
  await delay(200);
  return mockCategories;
}

/** GET /api/cities/ */
export async function fetchCities() {
  await delay(200);
  return mockCities;
}

/**
 * GET /api/tools/<id>/reviews/
 * @param {number} id
 */
export async function fetchToolReviews(id) {
  await delay(300);
  return mockToolReviews.data;
}

/**
 * GET /api/tools/<id>/related/
 * @param {number} id
 */
export async function fetchRelatedTools(id) {
  await delay(300);
  return mockRelatedTools.data;
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
 * GET /api/rentals/my/?status=...
 * @param {string|null} statusFilter - یکی از RENTAL_STATUS_LABELS یا null برای همه
 */
export async function fetchMyRentals(statusFilter = null) {
  await delay(350);
  let results = [...mockMyRentals.data];
  if (statusFilter) {
    results = results.filter((r) => r.status === statusFilter);
  }
  return results;
}

/**
 * GET /api/rentals/my-tools/?status=...
 * @param {string|null} statusFilter
 */
export async function fetchMyToolRentals(statusFilter = null) {
  await delay(350);
  let results = [...mockMyToolRentals.data];
  if (statusFilter) {
    results = results.filter((r) => r.status === statusFilter);
  }
  return results;
}

/** GET /api/chat/conversations/ */
export async function fetchConversations() {
  await delay(300);
  return mockConversations.data;
}

/**
 * GET /api/chat/conversations/<id>/messages/
 * ⚠️ موقتی: mock فقط برای گفتگوی id=1 پیام واقعی دارد (همان دیتاست کامل
 * نمونه با انواع پیام). برای بقیه‌ی گفتگوها یک پیام عمومی برگردانده می‌شود
 * تا UI نشکند، چون mock فعلی محتوای کامل برای همه‌ی گفتگوها ندارد.
 */
export async function fetchConversationMessages(conversationId) {
  await delay(300);
  if (Number(conversationId) === 1) {
    return mockConversationMessages.data;
  }
  return { rental_context: null, messages: [] };
}

/** GET /api/reviews/tags/ */
export async function fetchReviewTags() {
  await delay(200);
  return mockReviewTags;
}

/**
 * POST /api/rentals/<rental_id>/review/
 * @param {number} rentalId
 * @param {Object} payload - { overall_rating, criteria, tags, comment, photos, is_public }
 */
export async function submitReview(rentalId, payload) {
  await delay(500);
  console.log(`[mock] ثبت نظر برای رزرو ${rentalId}:`, payload);
  return { status: "success" };
}

/** GET /api/tools/conditions/ (یا یک enum ثابت سمت فرانت) */
export async function fetchToolConditions() {
  await delay(150);
  return TOOL_CONDITIONS;
}

/**
 * POST /api/tools/
 * @param {Object} payload - { category_id, name, brand, model, description,
 *   condition, specs, images, delivery_options, daily_price, deposit_amount,
 *   city_id, address }
 */
export async function createTool(payload) {
  await delay(600);
  console.log("[mock] ثبت ابزار جدید:", payload);
  return { status: "success", data: { id: Math.floor(Math.random() * 1000) + 100 } };
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

/** کلاس خطای یکپارچه برای تشخیص نوع خطا در UI (مطابق mockErrors در mockData.js) */
export class ApiError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }
}