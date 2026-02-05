# 🚀 Deploy Production - Jespark Rewards

**วันที่:** 5 กุมภาพันธ์ 2026  
**สถานะ:** พร้อม Deploy ทันที! ✅

---

## 📋 ภาพรวม

เราจะ deploy 3 ส่วนหลัก:

```
┌─────────────────────────────────────────┐
│  1. Database (Supabase)     ✅ พร้อม    │
│  2. Backend (Railway/Vercel) 🚀 Deploy  │
│  3. Admin Panel (Netlify)    🚀 Deploy  │
└─────────────────────────────────────────┘
```

**เวลาที่ใช้:** ~30 นาที
**ค่าใช้จ่าย:** ฟรีทั้งหมด (Free Tier)

---

## ✅ Pre-Deployment Checklist

ก่อน deploy ให้ตรวจสอบ:

- [x] Supabase Database พร้อมใช้งาน
- [x] มี Supabase URL และ Service Key
- [x] Backend APIs ทดสอบแล้ว (local)
- [x] Admin Panel ทำงานได้ (local)
- [x] Frontend/Backend เชื่อมต่อกันได้
- [x] ไม่มี console errors
- [x] Code commit & push to GitHub
- [ ] **ต้องสร้าง GitHub Repository** (ถ้ายังไม่มี)

---

## 📦 Step 0: Push to GitHub (ถ้ายังไม่มี)

### 0.1 สร้าง GitHub Repository

1. ไปที่ https://github.com/new
2. ชื่อ repo: `jespark-rewards`
3. **Public** หรือ **Private** (แนะนำ Private)
4. **ไม่ต้อง** initialize with README
5. คลิก **Create repository**

### 0.2 Push Code

```bash
# ใน project root
git init
git add .
git commit -m "Initial commit - Ready for production"

# เชื่อมต่อ GitHub
git remote add origin https://github.com/YOUR_USERNAME/jespark-rewards.git
git branch -M main
git push -u origin main
```

✅ **Checkpoint:** Code อยู่บน GitHub แล้ว

---

## 🗄️ Step 1: Setup Database (Supabase)

### 1.1 สร้าง/เช็ค Supabase Project

1. ไปที่ https://supabase.com/dashboard
2. เลือก project ที่มีอยู่ หรือสร้างใหม่
3. จด URL และ Keys ไว้:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
Anon Key:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.2 Run Database Schema

1. ไปที่ **SQL Editor**
2. คัดลอก content จาก `server/supabase/schema.sql`
3. Paste และ **Run**
4. ✅ เห็น "Success"

### 1.3 ตรวจสอบ Tables

ไปที่ **Table Editor** ควรเห็น:
- ✅ users
- ✅ rewards
- ✅ transactions
- ✅ redemptions
- ✅ points_history
- ✅ cashier_transactions
- ✅ system_settings
- ✅ admin_users

### 1.4 สร้าง Admin User

ไปที่ **SQL Editor** และรัน:

```sql
INSERT INTO admin_users (username, email, password, name, role)
VALUES (
  'admin',
  'admin@jespark.com',
  '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', -- hash ของ 'admin123'
  'Admin User',
  'admin'
);
```

หรือใช้ API หลัง deploy backend:
```bash
curl -X POST https://your-backend.com/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@jespark.com",
    "password": "admin123",
    "name": "Admin User"
  }'
```

✅ **Checkpoint:** Database พร้อมใช้งาน

---

## 🔧 Step 2: Deploy Backend (Railway)

**แนะนำ Railway** เพราะ:
- ✅ ฟรี $5/เดือน
- ✅ ง่ายที่สุด
- ✅ รองรับ Node.js
- ✅ Auto-deploy จาก GitHub

### 2.1 สร้าง Railway Account

1. ไปที่ https://railway.app/
2. คลิก **Login with GitHub**
3. Authorize Railway

### 2.2 สร้าง Project

1. คลิก **New Project**
2. เลือก **Deploy from GitHub repo**
3. เลือก repository: `jespark-rewards`
4. คลิก **Deploy Now**

### 2.3 ตั้งค่า Environment Variables

1. คลิก project ที่สร้าง
2. ไปที่ **Variables**
3. คลิก **Raw Editor**
4. Paste:

```env
# Server
PORT=5001
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# CORS (อัปเดตหลังจาก deploy admin panel)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://your-admin-panel.netlify.app
```

**⚠️ สำคัญ:** เปลี่ยน `your-super-secret-jwt-key` เป็น random string:
```bash
# สร้าง random string:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.4 ตั้งค่า Build & Start

1. ไปที่ **Settings** → **Build**
2. **Root Directory:** `/server`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Watch Paths:** `server/**`

### 2.5 Deploy

1. คลิก **Deploy** (หรือรอ auto-deploy)
2. รอ 2-3 นาที
3. เช็ค **Deployments** tab → ✅ "Success"

### 2.6 จด Backend URL

คลิก **Generate Domain** → จะได้ URL เช่น:
```
https://jespark-backend.up.railway.app
```

**📝 จด URL นี้ไว้!**

### 2.7 ทดสอบ Backend

```bash
# Test health check
curl https://jespark-backend.up.railway.app/health

# Expected: {"status":"ok","timestamp":"..."}
```

✅ **Checkpoint:** Backend ทำงานบน Railway แล้ว

---

## 🎨 Step 3: Deploy Admin Panel (Netlify)

**เลือก Netlify** เพราะ:
- ✅ ฟรี
- ✅ รวดเร็ว
- ✅ รองรับ Vite/React
- ✅ มี `netlify.toml` config แล้ว

### 3.1 สร้าง Netlify Account

1. ไปที่ https://netlify.com/
2. คลิก **Sign up**
3. Login with GitHub

### 3.2 Import Project

1. คลิก **Add new site** → **Import an existing project**
2. เลือก **GitHub**
3. เลือก repository: `jespark-rewards`
4. คลิก **Deploy**

### 3.3 ตั้งค่า Build Settings

Netlify จะตรวจจับ `netlify.toml` อัตโนมัติ แต่ให้เช็คว่า:

```
Base directory: admin-panel
Build command:  npm run build
Publish dir:    admin-panel/dist
```

### 3.4 ตั้งค่า Environment Variables

1. ไปที่ **Site settings** → **Environment variables**
2. คลิก **Add a variable**
3. เพิ่ม:

```env
VITE_API_BASE_URL=https://jespark-backend.up.railway.app/api
```

**⚠️ สำคัญ:** ใช้ Backend URL จาก Step 2.6 + `/api`

### 3.5 Redeploy

1. ไปที่ **Deploys**
2. คลิก **Trigger deploy** → **Deploy site**
3. รอ 1-2 นาที

### 3.6 จด Admin Panel URL

จะได้ URL เช่น:
```
https://jespark-admin-xxxxxx.netlify.app
```

**📝 จด URL นี้ไว้!**

### 3.7 เพิ่ม Admin Panel URL ใน Backend CORS

กลับไปที่ Railway:
1. เปิด Backend project
2. ไปที่ **Variables**
3. แก้ไข `CORS_ORIGINS`:

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://jespark-admin-xxxxxx.netlify.app
```

4. บันทึก → Backend จะ redeploy อัตโนมัติ

✅ **Checkpoint:** Admin Panel ทำงานบน Netlify แล้ว

---

## 🧪 Step 4: ทดสอบ Production

### 4.1 ทดสอบ Backend API

```bash
# Health check
curl https://jespark-backend.up.railway.app/health

# Test admin login (ควร 401 - correct behavior)
curl https://jespark-backend.up.railway.app/api/auth/admin/login
```

### 4.2 ทดสอบ Admin Panel

1. เปิด `https://jespark-admin-xxxxxx.netlify.app`
2. ✅ เห็นหน้า Login
3. Login:
   - Username: `admin`
   - Password: `admin123`
4. ✅ เข้าสู่ Dashboard
5. ทดสอบแต่ละหน้า:
   - ✅ Dashboard โหลดข้อมูล
   - ✅ Cashier ค้นหาลูกค้าได้
   - ✅ Points โหลดประวัติ
   - ✅ Reports แสดงกราฟ
   - ✅ Settings โหลดการตั้งค่า

### 4.3 เช็ค Console

เปิด Browser DevTools → Console:
- ✅ ไม่มี CORS errors
- ✅ ไม่มี 404 errors
- ✅ API calls สำเร็จ (200 OK)

### 4.4 ทดสอบ Cashier Flow

1. ไปหน้า Cashier
2. ค้นหาลูกค้า (สร้าง test user ก่อน)
3. ใส่ยอดซื้อ
4. ยืนยันการชำระเงิน
5. ✅ แสดงข้อความสำเร็จ

✅ **Checkpoint:** ทุกอย่างทำงานบน Production!

---

## 🔒 Step 5: Security Checklist

### 5.1 Environment Variables

- [ ] เปลี่ยน `JWT_SECRET` เป็น random string
- [ ] ไม่มี sensitive data ใน code
- [ ] `.env` files ไม่ได้ commit to git

### 5.2 CORS

- [ ] CORS อนุญาตเฉพาะ domains ที่ต้องการ
- [ ] ไม่มี `*` ใน CORS origins

### 5.3 Admin Credentials

- [ ] เปลี่ยนรหัสผ่าน admin default
- [ ] ใช้รหัสผ่านที่แข็งแรง

### 5.4 Database

- [ ] Supabase RLS (Row Level Security) เปิดใช้งาน
- [ ] API Keys เก็บเป็นความลับ

✅ ทำ checklist ให้ครบ!

---

## 📊 URLs Summary

จดลงกระดาษหรือ save ไว้:

```
Database:
  Supabase URL: https://xxxxxxxxxxxxx.supabase.co

Backend:
  Railway URL: https://jespark-backend.up.railway.app
  API Base:    https://jespark-backend.up.railway.app/api

Admin Panel:
  Netlify URL: https://jespark-admin-xxxxxx.netlify.app

Admin Login:
  Username: admin
  Password: [เปลี่ยนแล้ว]
```

---

## 🔄 Step 6: Auto-Deploy Setup

### 6.1 Railway Auto-Deploy

✅ ตั้งค่าแล้วอัตโนมัติ

เมื่อ push code ใหม่ไป GitHub:
1. Railway จะ detect changes
2. Auto-deploy ใน 2-3 นาที

### 6.2 Netlify Auto-Deploy

✅ ตั้งค่าแล้วอัตโนมัติ

เมื่อ push code ใหม่ไป GitHub:
1. Netlify จะ detect changes
2. Auto-build & deploy ใน 1-2 นาที

### 6.3 ทดสอบ Auto-Deploy

```bash
# แก้ไข code
echo "// test" >> admin-panel/src/pages/Dashboard.tsx

# Commit & push
git add .
git commit -m "Test auto-deploy"
git push

# เช็ค Railway & Netlify dashboards
# ควรเห็น new deployment
```

---

## 🎯 Custom Domain (Optional)

### Option 1: Netlify Custom Domain

1. ไปที่ Netlify **Domain settings**
2. คลิก **Add custom domain**
3. ใส่ domain: `admin.jespark.com`
4. ตั้งค่า DNS records ตามที่แนะนำ

### Option 2: Railway Custom Domain

1. ไปที่ Railway **Settings**
2. คลิก **Add custom domain**
3. ใส่ domain: `api.jespark.com`
4. ตั้งค่า DNS records

---

## 📈 Monitoring & Logs

### Railway Logs

1. ไปที่ Railway project
2. คลิก **Observability**
3. เห็น real-time logs

### Netlify Logs

1. ไปที่ Netlify project
2. คลิก **Deploys** → เลือก deployment
3. คลิก **Deploy log**

### Supabase Logs

1. ไปที่ Supabase Dashboard
2. คลิก **Logs**
3. เห็น database queries

---

## ⚡ Performance Tips

### 1. Enable Caching

ตั้งค่าใน `netlify.toml`:
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. Compress Assets

Railway ทำ gzip อัตโนมัติ ✅

### 3. CDN

Netlify ใช้ CDN ทั่วโลกอัตโนมัติ ✅

---

## 🐛 Troubleshooting

### ปัญหา 1: Admin Panel ไม่โหลด

**อาการ:** หน้าขาว/blank

**แก้:**
1. เช็ค Console errors
2. เช็ค `VITE_API_BASE_URL` ใน Netlify
3. Redeploy Netlify

---

### ปัญหา 2: CORS Error

**อาการ:** `Access-Control-Allow-Origin` error

**แก้:**
1. เพิ่ม Netlify URL ใน Railway `CORS_ORIGINS`
2. ตรวจสอบ URL ไม่มี trailing slash
3. Redeploy Railway

---

### ปัญหา 3: 500 Internal Server Error

**อาการ:** API ตอบ 500

**แก้:**
1. เช็ค Railway logs
2. เช็ค Supabase credentials
3. เช็ค database connection

---

### ปัญหา 4: Login ไม่ได้

**อาการ:** 401 Unauthorized

**แก้:**
1. ตรวจสอบ admin user ใน database
2. เช็ค JWT_SECRET ตรงกันหรือไม่
3. ลองสร้าง admin user ใหม่

---

## ✅ Deployment Checklist

### Pre-Deployment
- [x] Code tested locally
- [x] Database schema ready
- [x] Environment variables prepared
- [x] GitHub repository created
- [x] Code pushed to GitHub

### Deployment
- [ ] Supabase database setup ✅
- [ ] Backend deployed to Railway ✅
- [ ] Admin Panel deployed to Netlify ✅
- [ ] CORS configured ✅
- [ ] Environment variables set ✅

### Testing
- [ ] Backend API works ✅
- [ ] Admin Panel loads ✅
- [ ] Login successful ✅
- [ ] All pages functional ✅
- [ ] No console errors ✅

### Security
- [ ] Changed default passwords ✅
- [ ] JWT secret is random ✅
- [ ] CORS properly configured ✅
- [ ] No sensitive data exposed ✅

### Optional
- [ ] Custom domain setup
- [ ] SSL certificate (auto by Netlify/Railway)
- [ ] Monitoring enabled
- [ ] Backups configured

---

## 🎉 Success!

**🎊 ระบบ Deploy เสร็จแล้ว!**

### URLs ของคุณ:

```
🌐 Admin Panel: https://jespark-admin-xxxxxx.netlify.app
🔌 Backend API: https://jespark-backend.up.railway.app/api
🗄️ Database:    https://xxxxxxxxxxxxx.supabase.co
```

### ขั้นตอนถัดไป:

1. ✅ เปลี่ยนรหัสผ่าน admin
2. ✅ สร้าง test users
3. ✅ ทดสอบ Cashier flow
4. ✅ Setup monitoring
5. ✅ (Optional) Custom domain

---

## 📚 Resources

- **Railway Docs:** https://docs.railway.app/
- **Netlify Docs:** https://docs.netlify.com/
- **Supabase Docs:** https://supabase.com/docs
- **Support:** ดูไฟล์ `TROUBLESHOOTING.md`

---

**🚀 Happy Deploying!**

**เวลาที่ใช้ทั้งหมด:** ~30 นาที  
**ค่าใช้จ่าย:** ฿0 (ใช้ Free Tier ทั้งหมด)

---

## 🔄 การ Update Production

เมื่อต้องการ update code:

```bash
# 1. แก้ไข code
# 2. Test locally
# 3. Commit & push

git add .
git commit -m "Update: [อธิบายการเปลี่ยนแปลง]"
git push

# 4. Railway & Netlify จะ auto-deploy
# 5. รอ 2-3 นาที
# 6. ตรวจสอบว่าทำงานถูกต้อง
```

**ง่ายมาก!** 🎉
