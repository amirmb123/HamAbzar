# 🔧 HamAbzar — Local Tool Sharing & Rental Platform

> سامانه مکان‌محور کرایه و اشتراک‌گذاری ابزارآلات خانگی و صنعتی  
> درس مهندسی نرم‌افزار | بهار 1405

---

## 📋 فهرست مطالب

- [معرفی پروژه](#معرفی-پروژه)
- [تکنولوژی‌ها](#تکنولوژیها)
- [ساختار ریپو](#ساختار-ریپو)
- [نصب و راه‌اندازی بک‌اند](#نصب-و-راهاندازی-بکاند)
- [نصب و راه‌اندازی فرانت‌اند](#نصب-و-راهاندازی-فرانتاند)
- [متغیرهای محیطی](#متغیرهای-محیطی)
- [API های موجود](#api-های-موجود)
- [قوانین Git](#قوانین-git)
- [تقسیم کار تیم](#تقسیم-کار-تیم)
- [وضعیت پروژه](#وضعیت-پروژه)

---

## معرفی پروژه

HamAbzar یک پلتفرم اشتراک‌گذاری ابزار است که همسایگان را به هم وصل می‌کند.  
به جای خرید ابزار گران‌قیمت برای یک کار یک‌باره، آن را از کسی در همان محله کرایه می‌کنی.

**سه نقش اصلی:**
- 🔧 **صاحب ابزار** — ابزار ثبت می‌کند و اجاره می‌دهد
- 🙋 **کرایه‌گیرنده** — ابزار جستجو و رزرو می‌کند
- 🛡️ **ادمین** — اختلافات را داوری می‌کند

---

## تکنولوژی‌ها

| لایه | ابزار |
|------|-------|
| Backend | Python 3.12 + Django 5 + Django REST Framework |
| Authentication | JWT via `djangorestframework-simplejwt` |
| Database | PostgreSQL 15 |
| Frontend | React 18 + Vite |
| HTTP Client | Axios |
| Map | React Leaflet + OpenStreetMap |
| Image Storage | Django Media Files + Pillow |

---

## ساختار ریپو

```
hamabzar/
├── Backend/                  ← Django project
│   ├── config/               ← settings, main urls
│   ├── accounts/             ← User model, OTP, JWT auth
│   ├── tools/                ← Tool listings, images, search
│   ├── rentals/              ← Rental flow, transactions, reviews
│   ├── disputes/             ← Dispute management
│   ├── chat/                 ← In-rental messaging
│   ├── requirements.txt
│   └── .env.example
└── Frontend/                 ← React project
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── services/
    └── package.json
```

---

## نصب و راه‌اندازی بک‌اند

### پیش‌نیازها
- Python 3.12+
- PostgreSQL 15+
- Git

### مراحل

**۱. کلون کردن ریپو**
```bash
git clone https://github.com/your-team/hamabzar.git
cd hamabzar/Backend
```

**۲. ساختن محیط مجازی**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate
```

**۳. نصب پکیج‌ها**
```bash
pip install -r requirements.txt
```

**۴. تنظیم متغیرهای محیطی**
```bash
cp .env.example .env
# فایل .env را باز کن و مقادیر را پر کن
```

**۵. ساختن دیتابیس**
```bash
# در PostgreSQL:
CREATE DATABASE hamabzar_db;
CREATE USER hamabzar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hamabzar_db TO hamabzar_user;
```

**۶. اجرای Migration**
```bash
python manage.py migrate
```

**۷. ساختن superuser**
```bash
python manage.py createsuperuser
```

**۸. اضافه کردن داده اولیه (categories و cities)**
```bash
python manage.py shell

# داخل shell:
from tools.models import Category, City
Category.objects.bulk_create([
    Category(name='Drill'), Category(name='Ladder'),
    Category(name='Cleaning'), Category(name='Welding'),
    Category(name='Garden'), Category(name='Other'),
])
City.objects.bulk_create([
    City(name='Tehran'), City(name='Isfahan'), City(name='Shiraz'),
])
exit()
```

**۹. اجرای سرور**
```bash
python manage.py runserver
```

سرور روی `http://localhost:8000` اجرا می‌شود.  
پنل ادمین: `http://localhost:8000/admin`

---

## نصب و راه‌اندازی فرانت‌اند

### پیش‌نیازها
- Node.js 18+
- npm یا yarn

### مراحل

```bash
cd hamabzar/Frontend

# نصب پکیج‌ها
npm install

# اجرای سرور توسعه
npm run dev
```

فرانت روی `http://localhost:5173` اجرا می‌شود.

---

## متغیرهای محیطی

فایل `.env.example` را کپی کن و مقادیر را پر کن:

```env
# Django
SECRET_KEY=your-secret-key-minimum-32-characters-long
DEBUG=True

# Database
DB_NAME=hamabzar_db
DB_USER=hamabzar_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

> ⚠️ **مهم:** فایل `.env` را هرگز commit نکن. در `.gitignore` قرار دارد.

---

## API های موجود

### Authentication — `http://localhost:8000/api/auth/`

| Method | Endpoint | Auth | توضیح |
|--------|----------|------|-------|
| POST | `/request-otp/` | ❌ | ارسال کد OTP |
| POST | `/verify-otp/` | ❌ | تأیید OTP + دریافت JWT |
| POST | `/refresh/` | ❌ | تمدید access token |
| GET | `/me/` | ✅ | اطلاعات کاربر جاری |

### Tools — `http://localhost:8000/api/tools/`

| Method | Endpoint | Auth | توضیح |
|--------|----------|------|-------|
| GET | `/tools/` | ❌ | لیست ابزارها + جستجوی مکانی |
| POST | `/tools/` | ✅ | ثبت ابزار جدید |
| GET | `/tools/<id>/` | ❌ | جزئیات ابزار |
| PATCH | `/tools/<id>/` | ✅ | ویرایش (فقط صاحب) |
| DELETE | `/tools/<id>/` | ✅ | حذف (فقط صاحب) |
| GET | `/tools/<id>/availability/` | ❌ | تقویم روزهای اشغال |
| POST | `/tools/<id>/images/` | ✅ | آپلود تصویر |
| GET | `/categories/` | ❌ | لیست دسته‌بندی‌ها |
| GET | `/cities/` | ❌ | لیست شهرها |

### Rentals — `http://localhost:8000/api/rentals/` (در حال توسعه)

| Method | Endpoint | Auth | توضیح |
|--------|----------|------|-------|
| POST | `/rentals/` | ✅ | ثبت رزرو |
| GET | `/rentals/my/` | ✅ | رزروهای من |
| POST | `/rentals/<id>/confirm/` | ✅ | تأیید توسط صاحب |
| POST | `/rentals/<id>/return/` | ✅ | برگشت ابزار |
| POST | `/rentals/<id>/dispute/` | ✅ | ثبت شکایت |

> 📄 برای مستندات کامل‌تر فایل `API_CONTRACT.docx` را در پوشه `/docs` ببینید.

---

## قوانین Git

### Branch Strategy

```
main          ← فقط نسخه نهایی تأییدشده
develop       ← branch اصلی توسعه
│
├── feature/auth-api
├── feature/tool-api
├── feature/rental-api
└── feature/login-ui
```

### قوانین

```
✅ هر feature یک branch جداگانه از develop
✅ هر merge نیاز به Pull Request دارد
✅ PR باید توسط حداقل یک نفر review شود
✅ پیام commit باید واضح باشد

❌ commit مستقیم به main یا develop ممنوع
❌ merge بدون PR ممنوع
❌ پیام commit مبهم مثل "fix" یا "update" ممنوع
```

### فرمت پیام Commit

```bash
# ✅ درست
git commit -m "Add OTP request endpoint with phone validation"
git commit -m "Fix rental date overlap check"
git commit -m "Update Tool serializer to include distance_km"

# ❌ اشتباه
git commit -m "fix"
git commit -m "update files"
git commit -m "asdfgh"
```

### روال روزانه

```bash
# قبل از شروع هر روز
git checkout develop
git pull origin develop

# ساختن branch جدید
git checkout -b feature/my-feature

# بعد از اتمام کار
git add .
git commit -m "Descriptive message"
git push origin feature/my-feature

# در GitHub: Pull Request بساز → assign به یک نفر → merge بعد از تأیید
```

---

## تقسیم کار تیم

| عضو | نقش | مسئولیت |
|-----|-----|---------|
| BE1 | Backend | Auth API، Rental API، Review API، دیتابیس |
| BE2 | Backend | Tools API، Dispute API، Chat API |
| FE1 | Frontend | Login page، Home page، صفحه جستجو |
| FE2 | Frontend | Tool detail، فرم ثبت ابزار، تقویم رزرو |
| FS | Full-Stack | Git/Deploy، Map integration، Chat UI |

---

## وضعیت پروژه

| بخش | وضعیت |
|-----|--------|
| دیتابیس PostgreSQL | ✅ کامل |
| Django Setup | ✅ کامل |
| Auth API | ✅ کامل |
| Tools API | ✅ کامل |
| Rental API | 🔄 در حال توسعه |
| Chat API | ⏳ هفته ۵ |
| Dispute API | ⏳ هفته ۵ |
| Frontend Login | 🔄 در حال طراحی |
| Frontend Home | 🔄 در حال طراحی |

---

## نکات مهم برای توسعه

**OTP در محیط توسعه**  
کد OTP در terminal چاپ می‌شود. نیازی به SMS واقعی نیست.

**تصاویر**  
فایل‌های آپلودی در پوشه `Backend/media/` ذخیره می‌شوند. این پوشه در `.gitignore` قرار دارد.

**CORS**  
فرانت روی `localhost:5173` باید بتواند با بک‌اند روی `localhost:8000` ارتباط برقرار کند. تنظیمات CORS در `settings.py` انجام شده.

**Postman Collection**  
فایل `hamabzar.postman_collection.json` در پوشه `/docs` قرار دارد. آن را import کن و همه endpoint‌ها را تست کن.

---

<div align="center">
  <sub>ساخته شده با ❤️ توسط تیم همابزار | درس مهندسی نرم‌افزار ۱۴۰۴</sub>
</div>
