# 🚀 Supabase Setup Guide - ใช้ Supabase ใน 5 นาที!

## ✅ ระบบพร้อมใช้ Supabase อยู่แล้ว!

ระบบของคุณมี Supabase configuration ครบแล้ว แค่ต้องตั้งค่า 2 อย่าง:

---

## 📝 Step 1: สร้าง Supabase Project

### 1.1 สร้าง Project ใหม่
1. ไปที่ https://supabase.com
2. Sign in (หรือ Sign up ถ้ายังไม่มี account)
3. คลิก **"New Project"**
4. กรอกข้อมูล:
   - **Name**: `jespark-rewards` (หรือชื่ออื่นที่ชอบ)
   - **Database Password**: สร้างรหัสผ่านแข็งแรง (เก็บไว้ดีๆ!)
   - **Region**: เลือก `Southeast Asia (Singapore)` (ใกล้ไทยที่สุด)
5. คลิก **"Create new project"**
6. รอประมาณ 2-3 นาที (กำลังสร้าง database)

### 1.2 Copy API Keys
เมื่อ project สร้างเสร็จแล้ว:
1. ไปที่ **Settings** → **API**
2. คุณจะเห็น:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (คีย์ยาวๆ)
   - **service_role key**: `eyJhbGc...` (คีย์ยาวๆ, คลิก "Reveal" เพื่อดู)

---

## 📝 Step 2: ตั้งค่า Environment Variables

### 2.1 สร้างไฟล์ `.env` ใน `server/`

```bash
# สร้างไฟล์ .env
cd server
notepad .env
```

### 2.2 Copy-Paste ข้อมูลนี้ลงไฟล์ `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5001
NODE_ENV=development

# CORS Origins (ถ้าต้องการ)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
```

**⚠️ แทนที่:**
- `https://xxxxx.supabase.co` → ใส่ **Project URL** ของคุณ
- `eyJhbGciOiJ...` → ใส่ **service_role key** ของคุณ

---

## 📝 Step 3: Import Database Schema

### 3.1 เปิด SQL Editor ใน Supabase
1. ใน Supabase Dashboard
2. ไปที่ **SQL Editor** (เมนูซ้าย)
3. คลิก **"New query"**

### 3.2 Copy Schema ทั้งหมดจากไฟล์

```bash
# ดู schema.sql
cat server/supabase/schema.sql
```

หรือเปิดไฟล์ `server/supabase/schema.sql` แล้ว Copy ทั้งหมด

### 3.3 Paste และ Run
1. Paste SQL code ลงใน SQL Editor
2. คลิก **"Run"** (หรือกด Ctrl+Enter)
3. รอสักครู่... จะเห็น **"Success. No rows returned"**

### 3.4 ตรวจสอบว่า Tables ถูกสร้างแล้ว
1. ไปที่ **Table Editor** (เมนูซ้าย)
2. คุณจะเห็น tables:
   - ✅ `system_settings`
   - ✅ `users`
   - ✅ `rewards`
   - ✅ `transactions`
   - ✅ `redemptions`
   - ✅ `notifications`
   - ✅ `coupons`
   - ✅ `stores`
   - ✅ `admin_users`
   - ✅ `cashier_transactions`

---

## 📝 Step 4: ทดสอบการเชื่อมต่อ

### 4.1 ทดสอบด้วย Test Script
```bash
# อยู่ในโฟลเดอร์ server/
npm run test
```

หรือ:
```bash
cd server
node test-supabase.js
```

### 4.2 คาดหวังผลลัพธ์:
```
✅ Supabase connected successfully
✅ Database tables exist
✅ System settings loaded: { points_earn_rate: 10, ... }
```

### 4.3 Restart Backend Server
```bash
# หยุด server เดิม (Ctrl+C)
npm start
```

---

## 📝 Step 5: ตรวจสอบใน Admin Panel

1. เปิด Admin Panel: http://localhost:3001
2. ลองใช้งานฟีเจอร์ต่างๆ:
   - ✅ ดู Dashboard (ควรโหลดข้อมูลจาก Supabase)
   - ✅ ดู Customers (ถ้ามีข้อมูล)
   - ✅ ดู Rewards
   - ✅ เพิ่ม/ลด Points
   - ✅ ตั้งค่าระบบ (Settings)

---

## 🔥 ไฟล์ที่เกี่ยวข้อง

### ✅ Backend Files (พร้อมใช้งานแล้ว)
- `server/config/supabase.js` - Supabase client configuration
- `server/supabase/schema.sql` - Database schema (267 lines)
- `server/routes/auth.js` - ใช้ Supabase สำหรับ login/register
- `server/routes/users.js` - ใช้ Supabase สำหรับ user data
- `server/routes/admin.js` - ใช้ Supabase สำหรับ admin operations
- `server/routes/cashier.js` - ใช้ Supabase สำหรับ transactions
- `server/routes/settings.js` - ใช้ Supabase สำหรับ system settings

### ✅ Environment File (ต้องสร้าง)
- `server/.env` - ใส่ SUPABASE_URL และ SUPABASE_SERVICE_KEY

---

## 🚨 Troubleshooting

### ❌ Error: "Missing Supabase credentials"
**สาเหตุ:** ไม่มีไฟล์ `.env` หรือไฟล์ `.env` ไม่ถูกต้อง

**แก้ไข:**
1. ตรวจสอบว่ามีไฟล์ `server/.env`
2. ตรวจสอบว่ามี `SUPABASE_URL` และ `SUPABASE_SERVICE_KEY`
3. Restart server

### ❌ Error: "relation 'users' does not exist"
**สาเหตุ:** ยังไม่ได้ import schema

**แก้ไข:**
1. ไปที่ Supabase → SQL Editor
2. Run ไฟล์ `server/supabase/schema.sql`

### ❌ Error: "Invalid API key"
**สาเหตุ:** API key ผิด

**แก้ไข:**
1. ตรวจสอบว่า copy **service_role key** มาถูกต้อง
2. ตรวจสอบว่าไม่มี space หรือ newline ใน `.env`

### ❌ Connection Timeout
**สาเหตุ:** Network หรือ Supabase project ไม่ active

**แก้ไข:**
1. ตรวจสอบ internet connection
2. เข้า Supabase Dashboard → ตรวจสอบว่า project status เป็น **Active**

---

## 📊 ข้อดีของ Supabase

✅ **PostgreSQL Database** - Database ที่แข็งแรงและรวดเร็ว  
✅ **Auto-scaling** - รองรับผู้ใช้เยอะๆ ได้  
✅ **Real-time** - Support WebSocket (ถ้าต้องการ real-time features)  
✅ **Row Level Security** - ความปลอดภัยระดับ row  
✅ **Free Tier** - 500MB database, 2GB file storage, 50,000 monthly active users  
✅ **Dashboard** - จัดการข้อมูลง่าย ไม่ต้องใช้ command line  
✅ **Backup** - Auto backup ทุกวัน (paid plan)

---

## 💰 ราคา Supabase

### Free Tier (เพียงพอสำหรับ development & small apps)
- ✅ 500 MB database space
- ✅ 2 GB file storage
- ✅ 50,000 monthly active users
- ✅ 500,000 requests per month
- ✅ Social OAuth providers
- ✅ Community support

### Pro Tier ($25/month) - เมื่อ scale ขึ้น
- ✅ 8 GB database space
- ✅ 100 GB file storage
- ✅ 100,000 monthly active users
- ✅ Daily backups
- ✅ Email support

---

## 🎯 Next Steps

หลังจาก setup Supabase แล้ว:

1. ✅ **Test ระบบ local** - ดูว่าทุกอย่างทำงานได้
2. ✅ **สร้าง Admin User** - สำหรับ login เข้า Admin Panel
3. ✅ **ใส่ข้อมูล Test** - สร้าง rewards, customers ทดสอบ
4. ✅ **Deploy to Production** - ดู `DEPLOY_COPY_PASTE.md`

---

## 📞 ต้องการความช่วยเหลือ?

ถ้ามีปัญหาหรือติดขัด บอกฉันได้เลยค่ะ! ฉันจะช่วยแก้ไข 😊

---

**สร้างโดย:** Cursor AI  
**วันที่:** 2026-02-05  
**เวอร์ชัน:** 1.0
