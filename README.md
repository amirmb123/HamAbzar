# 🔧 HamAbzar — Local Tool Sharing & Rental Platform

> سامانه مکان‌محور کرایه و اشتراک‌گذاری ابزارآلات خانگی و صنعتی  
> درس مهندسی نرم‌افزار | بهار ۱۴۰۵

---

## 📋 فهرست مطالب

- [معرفی پروژه](#معرفی-پروژه)
- [تکنولوژی‌ها](#تکنولوژیها)
- [ساختار ریپو](#ساختار-ریپو)
- [نصب و راه‌اندازی بک‌اند](#نصب-و-راهاندازی-بکاند)
- [نصب و راه‌اندازی فرانت‌اند](#نصب-و-راهاندازی-فرانتاند)
- [متغیرهای محیطی](#متغیرهای-محیطی)
- [API های موجود](#api-های-موجود)
- [منطق مالی (Wallet / Escrow)](#منطق-مالی-wallet--escrow)
- [اجرای تست‌ها](#اجرای-تستها)
- [قوانین Git](#قوانین-git)
- [وضعیت پروژه](#وضعیت-پروژه)

---

## معرفی پروژه

HamAbzar یک پلتفرم اشتراک‌گذاری ابزار است که همسایگان را به هم وصل می‌کند.  
به جای خرید ابزار گران‌قیمت برای یک کار یک‌باره، آن را از کسی در همان محله کرایه می‌کنی.

**سه نقش اصلی:**
- 🔧 **صاحب ابزار** — ابزار ثبت می‌کند و اجاره می‌دهد
- 🙋 **کرایه‌گیرنده** — ابزار جستجو و رزرو می‌کند
- 🛡️ **ادمین** — اختلافات (Dispute) را داوری می‌کند

---

## تکنولوژی‌ها

| لایه | ابزار |
|------|-------|
| Backend | Python 3.12 + Django 5.2 + Django REST Framework |
| Authentication | JWT via `djangorestframework-simplejwt` |
| Database | PostgreSQL 15 |
| Frontend | React 18 + Vite |
| HTTP Client | Axios / fetch |
| Map | React Leaflet + OpenStreetMap |
| Image Storage | Django Media Files + Pillow |

---

## ساختار ریپو

```
hamabzar/
├── Backend/                  ← Django project
│   ├── config/                ← settings, root urls
│   ├── accounts/               ← User model, OTP, JWT auth, profile
│   ├── tools/                  ← Tool listings, images, categories/cities, search
│   ├── rentals/                ← Rental lifecycle, transactions, reviews, chat
│   ├── disputes/               ← Dispute create / list / resolve (admin)
│   ├── chat/                   ← Message model (مصرف‌شده توسط rentals)
│   ├── requirements.txt
│   └── .env.example
└── Frontend/                  ← React project
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── services/
    └── package.json
```

> ℹ️ مدل `Message` در اپ `chat` تعریف شده، اما endpoint های چت زیر مسیر
> `rentals` قرار دارند (`/api/rentals/<id>/messages/`) چون پیام‌ها همیشه به یک
> رزرو مشخص وابسته‌اند.

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
```sql
-- در PostgreSQL:
CREATE DATABASE hamabzar_db;
CREATE USER hamabzar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hamabzar_db TO hamabzar_user;

-- اگر می‌خواهی python manage.py test را اجرا کنی، یوزر باید اجازه‌ی
-- ساخت دیتابیس تست را هم داشته باشد:
ALTER USER hamabzar_user CREATEDB;
```

**۶. اجرای Migration**
```bash
python manage.py makemigrations
python manage.py migrate
```

> ⚠️ اگر فیلد جدیدی به یک مدل اضافه می‌کنی، فایل migration ساخته‌شده توسط
> `makemigrations` باید داخل پوشه‌ی `<app>/migrations/` قرار بگیرد، نه مستقیم
> داخل پوشه‌ی اپ. در غیر این صورت Django اصلاً آن را اجرا نمی‌کند و با خطای
> `column ... does not exist` مواجه می‌شوی.

**۷. ساختن superuser**
```bash
python manage.py createsuperuser
```

**۸. اضافه کردن داده اولیه (categories و cities)**
```bash
python manage.py shell
```
```python
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

سرور روی `http://127.0.0.1:8000` اجرا می‌شود.  
پنل ادمین: `http://127.0.0.1:8000/admin`

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

> فرانت با بک‌اند فقط از طریق REST API (`/api/...`) صحبت می‌کند — هیچ اتصال
> مستقیمی به دیتابیس ندارد. مطمئن شو سرور Django (`runserver`) همزمان روشن
> است، وگرنه تمام request های فرانت با خطای network شکست می‌خورند.

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

### Authentication — `http://127.0.0.1:8000/api/auth/`

| Method | Endpoint | Auth | توضیح |
|--------|----------|------|-------|
| POST | `/request-otp/` | ❌ | ارسال کد OTP (در dev فقط در ترمینال چاپ می‌شود) |
| POST | `/verify-otp/` | ❌ | تأیید OTP — اگر کاربر موجود باشد JWT می‌دهد، وگرنه `temp_token` برای ثبت‌نام |
| POST | `/register/` | با `temp_token` | تکمیل ثبت‌نام کاربر جدید (username, password, ...) |
| POST | `/login/` | ❌ | لاگین با username/password |
| POST | `/refresh/` | ❌ | تمدید access token با refresh token |
| GET | `/me/` | ✅ | اطلاعات کاربر جاری |
| PATCH | `/me/` | ✅ | ویرایش پروفایل |

### Tools — `http://127.0.0.1:8000/api/tools/`

| Method | Endpoint | Auth | توضیح |
|--------|----------|------|-------|
| GET | `/tools/` | ❌ | لیست ابزارها (فقط `is_available=True`) + فیلتر + جستجوی مکانی |
| POST | `/tools/` | ✅ | ثبت ابزار جدید |
| GET | `/tools/<id>/` | ❌ | جزئیات ابزار |
| PATCH | `/tools/<id>/` | ✅ | ویرایش (فقط صاحب) |
| DELETE | `/tools/<id>/` | ✅ | حذف (فقط صاحب) |
| GET | `/tools/<id>/availability/` | ❌ | تقویم روزهای اشغال |
| POST | `/tools/<id>/images/` | ✅ | آپلود تصویر (فقط صاحب، حداکثر ۵ تصویر) |
| GET | `/tools/categories/` | ❌ | لیست دسته‌بندی‌ها |
| GET | `/tools/cities/` | ❌ | لیست شهرها |

### Rentals & Reviews & Chat — `http://127.0.0.1:8000/api/rentals/`

| Method | Endpoint | Auth | توضیح |
|--------|----------|------|-------|
| POST | `/rentals/` | ✅ | ثبت رزرو (پول از کیف‌پول borrower رزرو/escrow می‌شود) |
| GET | `/rentals/my/` | ✅ | رزروهایی که خودم به‌عنوان borrower ثبت کرده‌ام |
| GET | `/rentals/my-tools/` | ✅ | رزروهای ثبت‌شده روی ابزارهای من (به‌عنوان owner) |
| GET | `/rentals/<id>/` | ✅ | جزئیات یک رزرو |
| POST | `/rentals/<id>/confirm/` | ✅ | تأیید رزرو توسط صاحب ابزار |
| POST | `/rentals/<id>/handover/` | ✅ | تحویل فیزیکی ابزار (confirmed → active) |
| POST | `/rentals/<id>/return/` | ✅ | بازگشت ابزار — تسویه‌ی نهایی کرایه و ضمانت |
| POST | `/rentals/<id>/cancel/` | ✅ | لغو رزرو (فقط در وضعیت pending) — بازگشت کامل پول |
| POST | `/rentals/<id>/dispute/` | ✅ | ثبت شکایت روی رزرو active یا returned |
| POST | `/rentals/<id>/review/` | ✅ | ثبت امتیاز به طرف مقابل (بعد از return) |
| GET / POST | `/rentals/<id>/messages/` | ✅ | چت بین borrower و owner برای یک رزرو |

### Disputes — `http://127.0.0.1:8000/api/disputes/`

| Method | Endpoint | Auth | توضیح |
|--------|----------|------|-------|
| GET | `/disputes/` | ✅ ادمین | لیست شکایت‌ها، فیلتر اختیاری با `?status=open\|under_review\|resolved` |
| PATCH | `/disputes/<id>/resolve/` | ✅ ادمین | حل شکایت — تعیین `resolution` و `penalty_amount` |

> 📄 برای تست کامل و آماده‌ی همه‌ی endpoint‌ها به فایل Postman Collection در
> پوشه‌ی `/docs` مراجعه کن (بخش «Postman Collection» پایین‌تر).

---

## منطق مالی (Wallet / Escrow)

برای جلوگیری از سردرگمی، جریان پول در طول یک رزرو به‌صورت خلاصه:

1. **ساخت رزرو (`POST /rentals/`)** — کل `total_price + deposit_held` فوراً از
   `wallet_balance` کرایه‌گیرنده کسر می‌شود (پیش از تأیید صاحب ابزار).
2. **لغو (`cancel`)** — اگر رزرو هنوز `pending` باشد، کل مبلغ بدون کسری به
   کرایه‌گیرنده برمی‌گردد.
3. **بازگشت عادی (`return`)** — `deposit_held` کامل به کرایه‌گیرنده برمی‌گردد و
   `total_price` کامل به صاحب ابزار پرداخت می‌شود.
4. **شکایت (`dispute` → ادمین `resolve`)**
   - اگر رزرو هنوز `active` باشد: `penalty_amount` از `deposit_held` کسر و به
     owner داده می‌شود، مابقی به borrower برمی‌گردد؛ `total_price` هم در همین
     لحظه و به‌طور کامل به owner پرداخت می‌شود.
   - اگر رزرو از قبل `returned` شده باشد (یعنی پول‌ها قبلاً نهایی شده‌اند):
     `penalty_amount` مستقیماً از `wallet_balance` کرایه‌گیرنده کسر و به owner
     اضافه می‌شود (نه از یک سپرده‌ی از قبل‌رهاشده).

هر حرکت پول یک رکورد `Transaction` می‌سازد تا تاریخچه‌ی مالی هر کاربر قابل
بازسازی و audit باشد.

---

## اجرای تست‌ها

```bash
python manage.py test
```

> هر اپ (`accounts`, `tools`, `rentals`, `disputes`, `chat`) پوشه‌ی `tests/`
> مخصوص خود را دارد. اجرای تست یک دیتابیس موقت (`test_<DB_NAME>`) می‌سازد؛
> یوزر دیتابیست باید پرمیژن `CREATEDB` داشته باشد (به بخش نصب بک‌اند نگاه کن).

برای اجرای تست‌های فقط یک اپ:
```bash
python manage.py test disputes
```

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

## وضعیت پروژه

| بخش | وضعیت |
|-----|--------|
| دیتابیس PostgreSQL | ✅ کامل |
| Django Setup | ✅ کامل |
| Auth API (OTP + login + register) | ✅ کامل |
| Tools API | ✅ کامل |
| Rental API (کل چرخه: confirm → handover → return / cancel) | ✅ کامل |
| Review API | ✅ کامل |
| Chat API | ✅ کامل |
| Dispute API | ✅ کامل |
| تست‌های Django (همه‌ی اپ‌ها) | 🔄 در حال تکمیل |
| Frontend Login | 🔄 در حال طراحی |
| Frontend Home | 🔄 در حال طراحی |

---

## نکات مهم برای توسعه

**OTP در محیط توسعه**  
کد OTP در terminal چاپ می‌شود. نیازی به SMS واقعی نیست.

**تصاویر**  
فایل‌های آپلودی در پوشه `Backend/media/` ذخیره می‌شوند. این پوشه در `.gitignore` قرار دارد.

**CORS**  
فرانت روی `localhost:5173` یا `localhost:3000` باید بتواند با بک‌اند روی
`127.0.0.1:8000` ارتباط برقرار کند. تنظیمات در `CORS_ALLOWED_ORIGINS` داخل
`settings.py` انجام شده است. اگر فرانت روی پورت یا origin دیگری اجرا می‌شود
(مثلاً با `127.0.0.1` به‌جای `localhost`، یا پورت متفاوت)، باید آن را به همین
لیست اضافه کنی.

**Postman Collection**  
فایل کالکشن Postman در پوشه `/docs` قرار دارد و شامل فولدرهای جدا برای Auth،
Tools، Rentals، Cancel Flow، Review، Chat و Dispute است. آن را import کن و
endpoint‌ها را به‌ترتیب تست کن (برخی تست‌ها به collection variable هایی مثل
`access_token`, `access_token_2`, `access_token_admin` نیاز دارند).

---

<div align="center">
  <sub>ساخته شده با ❤️ توسط تیم همابزار | درس مهندسی نرم‌افزار ۱۴۰۴</sub>
</div>
