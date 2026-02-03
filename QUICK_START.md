# 🚀 Quick Start Guide - Jespark Rewards

## 📋 สิ่งที่ต้องเตรียม

### 1. LINE Developers Account
- สร้าง LINE Login Channel
- สร้าง LIFF App
- รับ LIFF ID และ Channel credentials

### 2. Supabase Account
- สร้าง Supabase project
- รัน SQL schema
- รับ API credentials

---

## ⚡ การติดตั้งและรัน (5 นาที)

### Step 1: Clone และติดตั้ง Dependencies

```bash
cd c:\Users\PC\Desktop\newlnw

# ติดตั้ง Frontend dependencies
npm install

# ติดตั้ง Backend dependencies
cd server
npm install
cd ..
```

### Step 2: ตั้งค่า Environment Variables

#### Frontend (.env)
สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:

```env
# LINE LIFF (ใส่ค่าจริงจาก LINE Developers)
VITE_LIFF_ID=your-liff-id-here
VITE_LINE_CHANNEL_ID=your-channel-id-here

# Backend API
VITE_API_URL=http://localhost:5000
```

#### Backend (server/.env)
ไฟล์ `server/.env` มีอยู่แล้ว แค่ตรวจสอบ:

```env
PORT=5000
JWT_SECRET=your-secret-key
NODE_ENV=development

# LINE Configuration
LINE_CHANNEL_ID=your-channel-id-here
LINE_CHANNEL_SECRET=your-channel-secret-here

# Supabase
SUPABASE_URL=https://vzlywwykogfzyjryhdrq.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

### Step 3: รัน Backend Server

```bash
cd server
npm start
```

Backend จะรันที่: http://localhost:5000

### Step 4: รัน Frontend App

เปิด Terminal ใหม่:

```bash
cd c:\Users\PC\Desktop\newlnw
npm run dev
```

Frontend จะรันที่: http://localhost:3000

---

## 🎯 การทดสอบ

### 1. ทดสอบด้วย Mock Login (ไม่ต้องตั้งค่า LINE)

1. เปิด http://localhost:3000
2. คลิก "เข้าสู่ระบบผ่าน LINE"
3. ระบบจะใช้ Mock data

### 2. ทดสอบด้วย LINE LIFF จริง

1. ตั้งค่า LIFF ID ใน `.env`
2. Restart frontend (`npm run dev`)
3. เปิด LIFF URL: `https://liff.line.me/your-liff-id`
4. หรือเปิดใน LINE app

---

## 📱 หน้าที่พร้อมใช้งาน

### Frontend (Port 3000)
- **Login**: http://localhost:3000/login
- **Home**: http://localhost:3000/
- **Rewards**: http://localhost:3000/rewards
- **Wallet**: http://localhost:3000/wallet
- **Profile**: http://localhost:3000/profile

### Backend (Port 5000)
- **API Root**: http://localhost:5000/api
- **Cashier Dashboard**: http://localhost:5000/index.html
- **Admin Dashboard**: http://localhost:5000/admin.html

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - Login
- `POST /api/auth/line-login` - LINE Login

### Users
- `GET /api/users/me` - ดูโปรไฟล์
- `PUT /api/users/me` - แก้ไขโปรไฟล์

### Rewards
- `GET /api/rewards` - ดูของรางวัล
- `POST /api/rewards/redeem` - แลกของรางวัล

### Wallet
- `GET /api/wallet/balance` - ดูยอดเงิน
- `POST /api/wallet/topup` - เติมเงิน
- `POST /api/wallet/payment` - ชำระเงิน

### Admin
- `GET /api/admin/stats` - สถิติ dashboard
- `GET /api/admin/users` - รายการ users
- `GET /api/admin/rewards` - รายการ rewards
- `GET /api/admin/transactions` - รายการธุรกรรม

---

## 🐛 Troubleshooting

### Frontend ไม่รัน
```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules
npm install
npm run dev
```

### Backend ไม่รัน
```bash
# ตรวจสอบ port 5000 ว่าว่างหรือไม่
taskkill /F /IM node.exe
cd server
npm start
```

### LIFF ไม่ทำงาน
1. ตรวจสอบ LIFF ID ใน `.env`
2. ตรวจสอบ Endpoint URL ใน LIFF settings
3. Clear cache และ reload

### Database Error
1. ตรวจสอบ Supabase credentials
2. ตรวจสอบว่ารัน SQL schema แล้ว
3. ตรวจสอบ network connection

---

## 📚 เอกสารเพิ่มเติม

- **LINE_LIFF_SETUP.md** - คู่มือตั้งค่า LINE LIFF
- **SUPABASE_SETUP.md** - คู่มือตั้งค่า Supabase
- **MIGRATION_COMPLETE.md** - สรุปการ migrate database
- **CASHIER_SYSTEM.md** - คู่มือระบบแคชเชียร์

---

## ✅ Checklist

### Development
- [ ] ติดตั้ง dependencies
- [ ] ตั้งค่า .env files
- [ ] รัน backend server
- [ ] รัน frontend app
- [ ] ทดสอบ mock login
- [ ] ทดสอบ API endpoints

### Production
- [ ] สร้าง LINE Login Channel
- [ ] สร้าง LIFF App
- [ ] ตั้งค่า production URLs
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] ทดสอบ LINE Login จริง
- [ ] ตั้งค่า SSL/HTTPS

---

**สร้างเมื่อ:** Feb 3, 2026  
**Version:** 1.0.0  
**Status:** ✅ Ready to use
