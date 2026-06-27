// ─────────────────────────────────────────────────────────────
// mockData.js — داده‌های نمونه برای فرانت‌اند همابزار
// استفاده: import { mockTools, mockUser, ... } from './mockData'
// وقتی API آماده شد فقط این فایل رو با api.js عوض کن
// ─────────────────────────────────────────────────────────────

// ─── کاربر لاگین‌کرده (خودمون) ──────────────────────────────
export const mockCurrentUser = {
  id: 101,
  phone: "09121234567",
  username: "ali_rezaei",
  full_name: "علی رضایی",
  email: "ali@example.com",
  wallet_balance: 5000000,
  rating: 4.7,
  avatar: null,
};

// ─── دسته‌بندی‌ها ─────────────────────────────────────────────
export const mockCategories = [
  { id: 1, name: "دریل و فرز" },
  { id: 2, name: "نردبان" },
  { id: 3, name: "باغبانی" },
  { id: 4, name: "جوشکاری" },
  { id: 5, name: "نظافت و شستشو" },
  { id: 6, name: "نجاری" },
  { id: 7, name: "رنگ‌کاری" },
  { id: 8, name: "اندازه‌گیری" },
];

// ─── شهرها ───────────────────────────────────────────────────
export const mockCities = [
  { id: 1, name: "تهران" },
  { id: 2, name: "اصفهان" },
  { id: 3, name: "مشهد" },
  { id: 4, name: "شیراز" },
  { id: 5, name: "تبریز" },
];

// ─── لیست ابزارها (GET /api/tools/) ─────────────────────────
export const mockTools = {
  count: 12,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: "دریل بوش ۱۳ میل",
      category: { id: 1, name: "دریل و فرز" },
      city: { id: 1, name: "تهران" },
      daily_price: 80000,
      deposit_amount: 500000,
      is_available: true,
      distance_km: 1.2,
      owner: { id: 102, full_name: "مریم احمدی", rating: 4.9, avatar: null },
      thumbnail: "https://placehold.co/300x200/e8f4f8/1a3c4d?text=دریل+بوش",
    },
    {
      id: 2,
      name: "نردبان آلومینیومی ۶ متری",
      category: { id: 2, name: "نردبان" },
      city: { id: 1, name: "تهران" },
      daily_price: 60000,
      deposit_amount: 800000,
      is_available: true,
      distance_km: 2.4,
      owner: { id: 103, full_name: "حسن موسوی", rating: 4.3, avatar: null },
      thumbnail: "https://placehold.co/300x200/f0f8e8/1a4d1a?text=نردبان",
    },
    {
      id: 3,
      name: "فرغون باغبانی",
      category: { id: 3, name: "باغبانی" },
      city: { id: 2, name: "اصفهان" },
      daily_price: 30000,
      deposit_amount: 200000,
      is_available: true,
      distance_km: 3.1,
      owner: { id: 104, full_name: "رضا کریمی", rating: 4.5, avatar: null },
      thumbnail: "https://placehold.co/300x200/f8f4e8/4d3a1a?text=فرغون",
    },
    {
      id: 4,
      name: "دستگاه جوش اینورتر ۲۰۰ آمپر",
      category: { id: 4, name: "جوشکاری" },
      city: { id: 1, name: "تهران" },
      daily_price: 150000,
      deposit_amount: 2000000,
      is_available: false,
      distance_km: 0.8,
      owner: { id: 105, full_name: "سارا محمدی", rating: 4.8, avatar: null },
      thumbnail: "https://placehold.co/300x200/f8e8e8/4d1a1a?text=دستگاه+جوش",
    },
    {
      id: 5,
      name: "کارواش خانگی ۱۵۰ بار",
      category: { id: 5, name: "نظافت و شستشو" },
      city: { id: 3, name: "مشهد" },
      daily_price: 90000,
      deposit_amount: 700000,
      is_available: true,
      distance_km: 4.5,
      owner: { id: 106, full_name: "امیر تهرانی", rating: 4.2, avatar: null },
      thumbnail: "https://placehold.co/300x200/e8e8f8/1a1a4d?text=کارواش",
    },
    {
      id: 6,
      name: "اره گردبر حرفه‌ای",
      category: { id: 6, name: "نجاری" },
      city: { id: 1, name: "تهران" },
      daily_price: 70000,
      deposit_amount: 600000,
      is_available: true,
      distance_km: 5.3,
      owner: { id: 107, full_name: "فاطمه نوری", rating: 4.6, avatar: null },
      thumbnail: "https://placehold.co/300x200/f8f0e8/4d2a1a?text=اره+گردبر",
    },
    {
      id: 7,
      name: "کمپرسور هوا ۲۵ لیتری",
      category: { id: 7, name: "رنگ‌کاری" },
      city: { id: 4, name: "شیراز" },
      daily_price: 100000,
      deposit_amount: 900000,
      is_available: true,
      distance_km: 2.9,
      owner: { id: 108, full_name: "داوود صادقی", rating: 5.0, avatar: null },
      thumbnail: "https://placehold.co/300x200/e8f8f0/1a4d2a?text=کمپرسور",
    },
    {
      id: 8,
      name: "ترازیاب لیزری خطی",
      category: { id: 8, name: "اندازه‌گیری" },
      city: { id: 2, name: "اصفهان" },
      daily_price: 120000,
      deposit_amount: 1200000,
      is_available: true,
      distance_km: 1.7,
      owner: { id: 109, full_name: "نجمه قربانی", rating: 4.0, avatar: null },
      thumbnail: "https://placehold.co/300x200/f0e8f8/2a1a4d?text=ترازیاب",
    },
  ],
};

// ─── جزئیات یک ابزار (GET /api/tools/1/) ────────────────────
export const mockToolDetail = {
  status: "success",
  data: {
    id: 1,
    name: "دریل بوش ۱۳ میل",
    description:
      "دریل چکشی حرفه‌ای مناسب بتون، فلز و چوب. دارای ۲ باتری یدک. کیف حمل و ست کامل مته موجود است. لطفاً ابزار را با همان لوازم پس دهید.",
    category: { id: 1, name: "دریل و فرز" },
    city: { id: 1, name: "تهران" },
    daily_price: 80000,
    deposit_amount: 500000,
    is_available: true,
    created_at: "2025-05-10T08:00:00+03:30",
    // ── فیلدهای جدید برای صفحه جزئیات (افزوده‌شده، بدون تغییر فیلدهای بالا) ──
    address: "تهران، پونک",
    views_count: 124,
    is_verified: true,
    specs: [
      { label: "توان", value: "۷۵۰ وات" },
      { label: "حداکثر قطر مته", value: "۱۳ میلی‌متر" },
      { label: "دور دقیقه", value: "۰ – ۳۰۰۰ rpm" },
      { label: "وزن", value: "۱.۸ کیلوگرم" },
      { label: "برند", value: "بوش آلمان" },
      { label: "حالت", value: "دریل / ضربه" },
    ],
    owner: {
      id: 102,
      full_name: "مریم احمدی",
      rating: 4.9,
      avatar: null,
      successful_rentals: 28,
      member_since_year: 1402,
    },
    images: [
      {
        id: 1,
        image: "https://placehold.co/600x400/e8f4f8/1a3c4d?text=تصویر+جلو",
        is_primary: true,
      },
      {
        id: 2,
        image: "https://placehold.co/600x400/e8f4f8/1a3c4d?text=تصویر+کنار",
        is_primary: false,
      },
      {
        id: 3,
        image: "https://placehold.co/600x400/e8f4f8/1a3c4d?text=ست+کامل+مته",
        is_primary: false,
      },
    ],
  },
};

// ─── تقویم اشغال (GET /api/tools/1/availability/?month=2025-06) ──
export const mockAvailability = {
  status: "success",
  data: {
    booked_dates: [
      "2025-06-05",
      "2025-06-06",
      "2025-06-07",
      "2025-06-15",
      "2025-06-16",
      "2025-06-20",
      "2025-06-21",
      "2025-06-22",
    ],
  },
};

// ─── رزروهای من (GET /api/rentals/my/) ──────────────────────
export const mockMyRentals = {
  status: "success",
  data: [
    {
      id: 7,
      booking_code: "HA-10293",
      tool: {
        id: 1,
        name: "دریل بوش ۱۶ میلی ضربه‌ای",
        daily_price: 80000,
        deposit_amount: 500000,
        address: "تهران، پونک",
      },
      owner: { id: 102, full_name: "احمد رضایی", phone: "09221234567", rating: 4.9 },
      start_date: "2025-06-10",
      end_date: "2025-06-12",
      total_price: 398000,
      deposit_held: 500000,
      status: "pending",
      created_at: "2025-06-01T10:00:00+03:30",
    },
    {
      id: 8,
      booking_code: "HA-10184",
      tool: {
        id: 5,
        name: "چمن‌زن برقی هوندا HRG416",
        daily_price: 85000,
        deposit_amount: 450000,
        address: "تهران، سعادت‌آباد",
      },
      owner: { id: 106, full_name: "مریم کریمی", phone: "09351234567", rating: 4.3 },
      start_date: "2025-06-08",
      end_date: "2025-06-12",
      total_price: 340000,
      deposit_held: 450000,
      status: "active",
      delivered_at: "2025-06-08T10:00:00+03:30",
      created_at: "2025-06-05T09:00:00+03:30",
    },
    {
      id: 12,
      booking_code: "HA-10077",
      tool: { id: 8, name: "آچار دینامومتری دیجیتال", daily_price: 30000, deposit_amount: 150000 },
      owner: { id: 109, full_name: "سارا احمدی", phone: "09131234567", rating: 4.0 },
      start_date: "2025-06-01",
      end_date: "2025-06-04",
      total_price: 150000,
      deposit_held: 150000,
      status: "overdue",
      overdue_days: 2,
      created_at: "2025-05-28T08:00:00+03:30",
    },
    {
      id: 9,
      booking_code: "HA-09812",
      tool: { id: 4, name: "دستگاه جوش اینورتر ۲۰۰A", daily_price: 120000, deposit_amount: 800000 },
      owner: { id: 107, full_name: "رضا فرهادی", phone: "09191234567", rating: 4.6 },
      start_date: "2025-05-20",
      end_date: "2025-05-22",
      total_price: 240000,
      deposit_held: 800000,
      status: "returned",
      has_review: false,
      created_at: "2025-05-15T09:00:00+03:30",
    },
    {
      id: 13,
      booking_code: "HA-09650",
      tool: { id: 6, name: "پیچ‌گوشتی برقی بوش", daily_price: 95000, deposit_amount: 300000 },
      owner: { id: 103, full_name: "حسن موسوی", phone: "09351234567", rating: 4.3 },
      start_date: "2025-05-10",
      end_date: "2025-05-10",
      total_price: 95000,
      deposit_held: 0,
      status: "cancelled",
      cancelled_by: "owner",
      created_at: "2025-05-09T12:00:00+03:30",
    },
  ],
};

// ─── رزروهای ابزارهای من (GET /api/rentals/my-tools/) ────────
export const mockMyToolRentals = {
  status: "success",
  data: [
    {
      id: 10,
      booking_code: "HA-10401",
      tool: {
        id: 2,
        name: "نردبان آلومینیومی ۶ متری",
        daily_price: 60000,
        deposit_amount: 800000,
        address: "تهران، تهرانپارس",
      },
      borrower: { id: 103, full_name: "حسن موسوی", phone: "09351234567", rating: 4.3 },
      start_date: "2025-06-18",
      end_date: "2025-06-20",
      total_price: 120000,
      deposit_held: 800000,
      status: "pending",
      created_at: "2025-06-15T11:00:00+03:30",
    },
    {
      id: 11,
      booking_code: "HA-10184",
      tool: {
        id: 2,
        name: "نردبان آلومینیومی ۶ متری",
        daily_price: 60000,
        deposit_amount: 800000,
        address: "تهران، تهرانپارس",
      },
      borrower: { id: 104, full_name: "رضا کریمی", phone: "09161234567", rating: 4.5 },
      start_date: "2025-06-08",
      end_date: "2025-06-12",
      total_price: 240000,
      deposit_held: 800000,
      status: "active",
      delivered_at: "2025-06-08T10:00:00+03:30",
      created_at: "2025-06-03T11:00:00+03:30",
    },
    {
      id: 14,
      booking_code: "HA-09980",
      tool: { id: 2, name: "نردبان آلومینیومی ۶ متری", daily_price: 60000, deposit_amount: 800000 },
      borrower: { id: 108, full_name: "داوود صادقی", phone: "09301234567", rating: 5.0 },
      start_date: "2025-05-01",
      end_date: "2025-05-03",
      total_price: 120000,
      deposit_held: 800000,
      status: "returned",
      has_review: true,
      created_at: "2025-04-28T16:00:00+03:30",
    },
  ],
};

// ─── جزئیات یک رزرو (GET /api/rentals/7/) ───────────────────
export const mockRentalDetail = {
  status: "success",
  data: {
    id: 7,
    tool: { id: 1, name: "دریل بوش ۱۳ میل", daily_price: 80000, deposit_amount: 500000 },
    borrower: { id: 101, full_name: "علی رضایی", phone: "09121234567", rating: 4.7 },
    owner: { id: 102, full_name: "مریم احمدی", phone: "09221234567", rating: 4.9 },
    start_date: "2025-06-10",
    end_date: "2025-06-12",
    total_price: 160000,
    deposit_held: 500000,
    status: "confirmed",
    admin_note: "",
    created_at: "2025-06-01T10:00:00+03:30",
    updated_at: "2025-06-02T08:00:00+03:30",
  },
};

// ─── پیام‌های چت (GET /api/rentals/7/messages/) ──────────────
export const mockMessages = {
  status: "success",
  data: [
    {
      id: 1,
      sender_id: 102, // مریم احمدی (صاحب ابزار)
      sender_name: "مریم احمدی",
      type: "text",
      content: "سلام، خوش اومدید. ابزار آماده‌ست.",
      is_read: true,
      created_at: "2025-06-01T10:30:00+03:30",
    },
    {
      id: 2,
      sender_id: 101, // علی رضایی (من)
      sender_name: "علی رضایی",
      type: "text",
      content: "ممنون. فردا ساعت ۱۰ میام تحویل بگیرم.",
      is_read: true,
      created_at: "2025-06-01T10:45:00+03:30",
    },
    {
      id: 3,
      sender_id: 102,
      sender_name: "مریم احمدی",
      type: "text",
      content: "باشه، منتظرم.",
      is_read: false,
      created_at: "2025-06-01T11:00:00+03:30",
    },
  ],
};

// ─── گفتگوها (GET /api/chat/conversations/) ─────────────────
// ⚠️ این بخش قبلاً وجود نداشت؛ برای صفحه‌ی چت اضافه شده.
// هر گفتگو به یک رزرو (rental) و یک ابزار مرتبط است.
export const mockConversations = {
  status: "success",
  data: [
    {
      id: 1,
      rental_id: 7,
      counterparty: { id: 102, full_name: "احمد رضایی", is_online: true, avatar: null },
      tool: { id: 1, name: "دریل بوش ۱۶ میلی" },
      last_message_preview: "در حال تایپ...",
      last_message_at: "2026-06-21T10:28:00+03:30",
      unread_count: 2,
      is_typing: true,
    },
    {
      id: 2,
      rental_id: 10,
      counterparty: { id: 106, full_name: "مریم کریمی", is_online: false, avatar: null },
      tool: { id: 2, name: "چمن‌زن هوندا" },
      last_message_preview: "ممنون، چمن‌زن رو فردا میارم",
      last_message_at: "2026-06-20T18:00:00+03:30",
      unread_count: 0,
      is_typing: false,
    },
    {
      id: 3,
      rental_id: 9,
      counterparty: { id: 107, full_name: "رضا فرهادی", is_online: false, avatar: null },
      tool: { id: 4, name: "دستگاه جوش اینورتر" },
      last_message_preview: "باشه حتما، روز خوبی داشته باشید",
      last_message_at: "2026-06-18T09:00:00+03:30",
      unread_count: 0,
      is_typing: false,
    },
    {
      id: 4,
      rental_id: 12,
      counterparty: { id: 109, full_name: "سارا احمدی", is_online: false, avatar: null },
      tool: { id: 8, name: "آچار دینامومتری" },
      last_message_preview: "آچار رو کی برمیگردونید؟",
      last_message_at: "2026-06-16T14:00:00+03:30",
      unread_count: 1,
      is_typing: false,
    },
    {
      id: 5,
      rental_id: null,
      counterparty: { id: 110, full_name: "علی محمدی", is_online: false, avatar: null },
      tool: null,
      last_message_preview: "پیستوله رنگ هنوز موجوده؟",
      last_message_at: "2026-06-14T11:00:00+03:30",
      unread_count: 0,
      is_typing: false,
    },
  ],
};

// ─── پیام‌های گفتگوی ۱ (GET /api/chat/conversations/1/messages/) ──
// نمونه‌ی کامل با انواع پیام: متن، عکس، و کارت پیشنهاد رزرو.
export const mockConversationMessages = {
  status: "success",
  data: {
    rental_context: {
      rental_id: 7,
      tool: { id: 1, name: "دریل بوش ۱۶ میلی ضربه‌ای", daily_price: 45000 },
      booking_code: "HA-10293",
      date_range_label: "۱۰ تا ۱۳ دی",
    },
    messages: [
      {
        id: 1,
        sender_id: 102,
        type: "text",
        content: "سلام، وقت بخیر! دریل بوش هنوز برای تاریخ ۱۰ تا ۱۳ دی موجوده 🙂",
        created_at: "2026-06-21T10:22:00+03:30",
      },
      {
        id: 2,
        sender_id: 101,
        type: "text",
        content: "سلام ممنون! می‌خواستم بپرسم ست مته‌هاش هم همراهشه؟",
        created_at: "2026-06-21T10:24:00+03:30",
        is_read: true,
      },
      {
        id: 3,
        sender_id: 102,
        type: "text",
        content: "بله، ست ۱۰ عددی مته همراه کیف حملش هست. عکس می‌فرستم",
        created_at: "2026-06-21T10:25:00+03:30",
      },
      {
        id: 4,
        sender_id: 102,
        type: "image",
        image_url: "https://placehold.co/440x300/e8f4f8/1a3c4d?text=ست+مته",
        created_at: "2026-06-21T10:25:30+03:30",
      },
      {
        id: 5,
        sender_id: 101,
        type: "text",
        content: "عالیه، پس رزرو می‌کنم",
        created_at: "2026-06-21T10:27:00+03:30",
        is_read: true,
      },
      {
        id: 6,
        sender_id: 101,
        type: "offer",
        offer: {
          date_range_label: "۱۰ تا ۱۳ دی",
          total_price: 398000,
          rental_id: 7,
          status: "pending",
        },
        created_at: "2026-06-21T10:28:00+03:30",
        is_read: true,
      },
    ],
  },
};

// ─── نظرات کاربران برای یک ابزار (GET /api/tools/<id>/reviews/) ──
// ⚠️ این بخش قبلاً در mockData وجود نداشت و برای صفحه جزئیات ابزار اضافه شده.
export const mockToolReviews = {
  status: "success",
  data: {
    average_rating: 4.8,
    total_count: 12,
    breakdown: { 5: 80, 4: 15, 3: 5, 2: 0, 1: 0 }, // درصد هر امتیاز
    reviews: [
      {
        id: 1,
        reviewer_name: "محمد کاظمی",
        rating: 5,
        comment:
          "دریل خوبی بود، تمیز و سالم. صاحب ابزار خیلی مودبانه تحویل داد و راهنمایی کرد. حتماً دوباره از این فروشنده اجاره می‌کنم.",
        created_at: "2025-05-26T12:00:00+03:30",
      },
      {
        id: 2,
        reviewer_name: "سارا اسدی",
        rating: 4,
        comment: "کارکرد خوبی داشت. فقط کمی دیرتر از موعد تحویل داده شد ولی کیفیت ابزار عالی بود.",
        created_at: "2025-05-10T12:00:00+03:30",
      },
    ],
  },
};

// ─── وضعیت‌های ممکن برای کیفیت ظاهری ابزار (فرم ثبت ابزار) ───
// ⚠️ این بخش قبلاً وجود نداشت.
export const TOOL_CONDITIONS = [
  "نو / کارکرده ندیده",
  "در حد نو",
  "کارکرده — سالم",
  "کارکرده — نیاز به دقت",
];

// ─── صف مدیریت ابزارها برای ادمین (GET /api/admin/tools/) ───
// ⚠️ این بخش قبلاً وجود نداشت. متفاوت از mockTools (که فقط ابزارهای
// *موجود برای کرایه* را نشان می‌دهد)؛ این لیست همه‌ی ابزارهای سیستم
// را با وضعیت بررسی ادمین (pending/approved/rejected) نشان می‌دهد.
export const mockAdminToolsQueue = [
  {
    id: 101,
    name: "فرز آنگولر بوش",
    category: { id: 1, name: "دریل و فرز" },
    owner: { id: 107, full_name: "رضا فرهادی" },
    daily_price: 40000,
    submitted_at: "2026-06-20T09:00:00+03:30",
    review_status: "pending",
    thumbnail: null,
  },
  {
    id: 102,
    name: "چمن‌زن هوندا HRG416",
    category: { id: 3, name: "باغبانی" },
    owner: { id: 106, full_name: "مریم کریمی" },
    daily_price: 85000,
    submitted_at: "2026-06-19T14:00:00+03:30",
    review_status: "pending",
    thumbnail: null,
  },
  {
    id: 1,
    name: "دریل بوش ۱۳ میل",
    category: { id: 1, name: "دریل و فرز" },
    owner: { id: 102, full_name: "مریم احمدی" },
    daily_price: 80000,
    submitted_at: "2026-05-10T08:00:00+03:30",
    review_status: "approved",
    thumbnail: null,
  },
  {
    id: 2,
    name: "نردبان آلومینیومی ۶ متری",
    category: { id: 2, name: "نردبان" },
    owner: { id: 103, full_name: "حسن موسوی" },
    daily_price: 60000,
    submitted_at: "2026-05-08T08:00:00+03:30",
    review_status: "approved",
    thumbnail: null,
  },
  {
    id: 4,
    name: "دستگاه جوش اینورتر ۲۰۰ آمپر",
    category: { id: 4, name: "جوشکاری" },
    owner: { id: 105, full_name: "سارا محمدی" },
    daily_price: 150000,
    submitted_at: "2026-05-01T08:00:00+03:30",
    review_status: "approved",
    thumbnail: null,
  },
  {
    id: 103,
    name: "پیستوله رنگ‌پاش بی‌کیفیت",
    category: { id: 7, name: "رنگ‌کاری" },
    owner: { id: 110, full_name: "علی محمدی" },
    daily_price: 20000,
    submitted_at: "2026-06-15T11:00:00+03:30",
    review_status: "rejected",
    rejection_reason: "تصاویر کافی نیست و توضیحات ناقص است",
    thumbnail: null,
  },
];

// ─── KPI های داشبورد ادمین (GET /api/admin/dashboard/) ──────
// ⚠️ این بخش قبلاً وجود نداشت. اعداد صرفاً نمایشی‌اند و با حجم
// واقعی mockTools/mockCurrentUser هم‌خوان نیستند — در API واقعی
// این مقادیر از شمارش سراسری دیتابیس می‌آیند، نه از این mock محدود.
export const mockAdminKpis = {
  active_tools: { value: 12480, trend_percent: 12, trend_direction: "up" },
  active_users: { value: 8210, trend_percent: 8, trend_direction: "up" },
  monthly_rentals: { value: 2940, trend_percent: 23, trend_direction: "up" },
  open_reports: { value: 14, trend_percent: 5, trend_direction: "down" },
};

// ─── روند رزروهای ۷ روز اخیر برای نمودار میله‌ای ─────────────
export const mockRentalTrend = [
  { label: "شنبه", height_percent: 58 },
  { label: "یکشنبه", height_percent: 72 },
  { label: "دوشنبه", height_percent: 45 },
  { label: "سه‌شنبه", height_percent: 80 },
  { label: "چهارشنبه", height_percent: 100 },
  { label: "پنجشنبه", height_percent: 64 },
  { label: "جمعه", height_percent: 38 },
];

// ─── موارد در انتظار بررسی ادمین ──────────────────────────────
export const mockPendingApprovals = [
  {
    id: 1,
    type: "new_listing",
    icon: "fa-solid fa-toolbox",
    title: "آگهی جدید: فرز آنگولر بوش",
    subtitle: "توسط رضا فرهادی",
  },
  {
    id: 2,
    type: "report",
    icon: "fa-solid fa-flag",
    title: "گزارش تخلف کاربر",
    subtitle: "علیه: کاربر #۴۴۲۱",
  },
  {
    id: 3,
    type: "listing_edit",
    icon: "fa-solid fa-toolbox",
    title: "ویرایش آگهی: چمن‌زن هوندا",
    subtitle: "توسط مریم کریمی",
  },
  {
    id: 4,
    type: "support_ticket",
    icon: "fa-solid fa-headset",
    title: "تیکت پشتیبانی جدید",
    subtitle: "مشکل در بازگشت ودیعه",
  },
];

// ─── تگ‌های سریع برای فرم ثبت نظر (GET /api/reviews/tags/) ───
// ⚠️ این بخش قبلاً وجود نداشت؛ برای فرم ثبت نظر اضافه شده.
export const mockReviewTags = [
  "ابزار تمیز و سالم",
  "پاسخ‌گویی سریع",
  "تحویل به‌موقع",
  "قیمت مناسب",
  "راهنمایی خوب",
  "بسته‌بندی مناسب",
];

// ─── معیارهای امتیازدهی فرم ثبت نظر ───────────────────────────
// ⚠️ این بخش هم قبلاً وجود نداشت.
export const REVIEW_CRITERIA = [
  { key: "tool_quality", label: "کیفیت ابزار", desc: "سالم بودن و عملکرد صحیح" },
  { key: "listing_accuracy", label: "دقت توضیحات آگهی", desc: "تطابق با توضیحات ثبت‌شده" },
  { key: "communication", label: "ارتباط با صاحب ابزار", desc: "سرعت پاسخ‌گویی و رفتار" },
  { key: "punctuality", label: "تحویل به‌موقع", desc: "رعایت زمان‌بندی توافق‌شده" },
];
// ─── ابزارهای مشابه (GET /api/tools/<id>/related/) ──────────
// ⚠️ این بخش هم قبلاً وجود نداشت؛ برای بخش «ابزارهای مشابه» اضافه شده.
export const mockRelatedTools = {
  status: "success",
  data: [
    { id: 21, name: "دریل مکیتا ۱۳mm", daily_price: 35000 },
    { id: 22, name: "دریل دیوالت ۲۰ ولت", daily_price: 55000 },
    { id: 23, name: "فرز آنگولر بوش", daily_price: 40000 },
  ],
};

// ─── status های ممکن برای رزرو ───────────────────────────────
// pending   → در انتظار تأیید صاحب ابزار
// confirmed → تأیید شده، منتظر تحویل
// active    → ابزار تحویل داده شده
// returned  → ابزار برگشت داده شده
// cancelled → لغو شده
// disputed  → در حال بررسی شکایت
// overdue   → تأخیر در بازگشت (⚠️ افزوده‌شده؛ در طراحی اولیه نبود ولی در UI کرایه‌های من لازم است)
export const RENTAL_STATUS_LABELS = {
  pending: "در انتظار تأیید",
  confirmed: "تأیید شده",
  active: "در حال استفاده",
  returned: "برگشت داده شده",
  cancelled: "لغو شده",
  disputed: "در حال بررسی",
  overdue: "تأخیر در بازگشت",
};

export const RENTAL_STATUS_COLORS = {
  pending: "orange",
  confirmed: "blue",
  active: "green",
  returned: "gray",
  cancelled: "red",
  disputed: "purple",
  overdue: "red",
};

// ─── نمونه پاسخ‌های خطا ──────────────────────────────────────
export const mockErrors = {
  unauthorized: { status: "error", message: "توکن ارائه نشده یا منقضی شده است." },
  forbidden: { status: "error", message: "شما اجازه انجام این عملیات را ندارید." },
  not_found: { status: "error", message: "مورد مورد نظر یافت نشد." },
  conflict: { status: "error", message: "این ابزار در تاریخ انتخابی رزرو است." },
  bad_request: { status: "error", message: "اطلاعات وارد شده معتبر نیست." },
  insufficient_balance: {
    status: "error",
    message: "موجودی کیف پول کافی نیست. مورد نیاز: ۶۶۰،۰۰۰ تومان، موجودی: ۲۰۰،۰۰۰ تومان",
  },
};
