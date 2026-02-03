# 🚀 Deployment Guide - Jespark Rewards

## 📋 Overview

เราจะ deploy ระบบขึ้น production ด้วย:
- **Frontend**: Vercel (ฟรี, รวดเร็ว, รองรับ React)
- **Backend**: Railway (ฟรี $5/เดือน, รองรับ Node.js + PostgreSQL)
- **Database**: Supabase (ใช้อยู่แล้ว)

---

## 🎯 Step 1: Deploy Backend (Railway)

### 1.1 สร้าง Railway Account

1. ไปที่ https://railway.app/
2. Sign up ด้วย GitHub
3. Verify email

### 1.2 สร้าง Project ใหม่

1. คลิก **New Project**
2. เลือก **Deploy from GitHub repo**
3. เชื่อมต่อ GitHub account
4. เลือก repository (หรือสร้าง repo ใหม่)

### 1.3 ตั้งค่า Environment Variables

ใน Railway Dashboard:

1. คลิก **Variables**
2. เพิ่ม variables เหล่านี้:

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-change-this

# Supabase
SUPABASE_URL=https://vzlywwykogfzyjryhdrq.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# LINE (จะตั้งค่าทีหลัง)
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_CALLBACK_URL=
```

### 1.4 ตั้งค่า Build Command

1. ไปที่ **Settings**
2. **Build Command**: `cd server && npm install`
3. **Start Command**: `cd server && npm start`
4. **Root Directory**: `/`

### 1.5 Deploy

1. คลิก **Deploy**
2. รอ build เสร็จ (2-3 นาที)
3. จะได้ URL เช่น: `https://jespark-backend.up.railway.app`

**📝 จด Backend URL ไว้!**

---

## 🎨 Step 2: Deploy Frontend (Vercel)

### 2.1 สร้าง Vercel Account

1. ไปที่ https://vercel.com/
2. Sign up ด้วย GitHub
3. Verify email

### 2.2 Import Project

1. คลิก **Add New** → **Project**
2. Import repository จาก GitHub
3. เลือก repository ของคุณ

### 2.3 ตั้งค่า Build Settings

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.4 ตั้งค่า Environment Variables

เพิ่ม variables:

```env
VITE_API_URL=https://jespark-backend.up.railway.app
VITE_LIFF_ID=(จะตั้งค่าทีหลัง)
VITE_LINE_CHANNEL_ID=(จะตั้งค่าทีหลัง)
```

### 2.5 Deploy

1. คลิก **Deploy**
2. รอ build เสร็จ (1-2 นาที)
3. จะได้ URL เช่น: `https://jespark-rewards.vercel.app`

**📝 จด Frontend URL ไว้!**

---

## 📱 Step 3: ตั้งค่า LINE LIFF

### 3.1 สร้าง LINE Login Channel

1. ไปที่ https://developers.line.biz/console/
2. สร้าง Provider และ LINE Login Channel (ตามคู่มือ LINE_LIFF_SETUP.md)

### 3.2 ตั้งค่า URLs

**Callback URL:**
```
https://jespark-rewards.vercel.app/auth/callback
```

**LIFF Endpoint URL:**
```
https://jespark-rewards.vercel.app
```

### 3.3 รับ Credentials

จะได้:
- LIFF ID: `1234567890-AbCdEfGh`
- Channel ID: `1234567890`
- Channel Secret: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## ⚙️ Step 4: อัปเดต Environment Variables

### 4.1 อัปเดต Vercel (Frontend)

1. ไปที่ Vercel Dashboard
2. เลือก Project
3. **Settings** → **Environment Variables**
4. อัปเดต:

```env
VITE_LIFF_ID=1234567890-AbCdEfGh
VITE_LINE_CHANNEL_ID=1234567890
VITE_API_URL=https://jespark-backend.up.railway.app
```

5. **Redeploy** (Deployments → ⋯ → Redeploy)

### 4.2 อัปเดต Railway (Backend)

1. ไปที่ Railway Dashboard
2. เลือก Project
3. **Variables**
4. อัปเดต:

```env
LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINE_CALLBACK_URL=https://jespark-rewards.vercel.app/auth/callback
```

5. Railway จะ auto-redeploy

---

## 🧪 Step 5: ทดสอบ

### 5.1 ทดสอบ Backend

เปิด browser:
```
https://jespark-backend.up.railway.app/api
```

ควรเห็น:
```json
{
  "message": "Jespark Rewards API",
  "version": "1.0.0",
  "status": "running"
}
```

### 5.2 ทดสอบ Frontend

เปิด:
```
https://jespark-rewards.vercel.app
```

### 5.3 ทดสอบ LINE Login

1. เปิด LINE app บนมือถือ
2. ส่ง LIFF URL ให้ตัวเอง:
   ```
   https://liff.line.me/1234567890-AbCdEfGh
   ```
3. คลิกลิงก์
4. Login ด้วย LINE
5. ระบบควรทำงานปกติ

---

## 🔒 Step 6: Security Checklist

- [ ] เปลี่ยน JWT_SECRET เป็นค่าที่ปลอดภัย
- [ ] ตั้งค่า CORS ให้ถูกต้อง
- [ ] เปิดใช้ HTTPS (Vercel/Railway ทำให้อัตโนมัติ)
- [ ] ตรวจสอบ Environment Variables
- [ ] ตั้งค่า Rate Limiting
- [ ] เก็บ secrets ใน environment variables เท่านั้น

---

## 📊 Monitoring

### Vercel Analytics

1. ไปที่ Vercel Dashboard
2. เลือก Project
3. **Analytics** tab
4. ดู traffic, performance

### Railway Logs

1. ไปที่ Railway Dashboard
2. เลือก Project
3. **Deployments** → คลิก deployment
4. ดู logs

---

## 🔄 การ Update

### อัปเดต Frontend

1. Push code ไป GitHub
2. Vercel จะ auto-deploy

### อัปเดต Backend

1. Push code ไป GitHub
2. Railway จะ auto-deploy

---

## 💰 ค่าใช้จ่าย

### ฟรี Tier

- **Vercel**: ฟรี (Hobby plan)
- **Railway**: $5 credit/เดือน (พอใช้งานได้)
- **Supabase**: ฟรี (Free tier)
- **LINE LIFF**: ฟรี

**รวม: $0-5/เดือน**

---

## 🆘 Troubleshooting

### Frontend ไม่โหลด

1. ตรวจสอบ build logs ใน Vercel
2. ตรวจสอบ environment variables
3. ตรวจสอบ VITE_API_URL

### Backend ไม่ทำงาน

1. ตรวจสอบ logs ใน Railway
2. ตรวจสอบ environment variables
3. ตรวจสอบ Supabase connection

### LINE Login ไม่ทำงาน

1. ตรวจสอบ LIFF ID
2. ตรวจสอบ Callback URL
3. ตรวจสอบ Endpoint URL
4. ดู browser console (F12)

---

## 📚 Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app/
- **LINE LIFF**: https://developers.line.biz/en/docs/liff/

---

## ✅ Deployment Checklist

### Backend (Railway)
- [ ] สร้าง Railway account
- [ ] สร้าง project
- [ ] ตั้งค่า environment variables
- [ ] Deploy สำเร็จ
- [ ] ทดสอบ API

### Frontend (Vercel)
- [ ] สร้าง Vercel account
- [ ] Import project
- [ ] ตั้งค่า build settings
- [ ] ตั้งค่า environment variables
- [ ] Deploy สำเร็จ
- [ ] ทดสอบเว็บ

### LINE LIFF
- [ ] สร้าง LINE Login Channel
- [ ] สร้าง LIFF App
- [ ] ตั้งค่า URLs
- [ ] รับ credentials
- [ ] อัปเดต environment variables
- [ ] ทดสอบ LINE Login

---

**Status**: Ready for deployment  
**Estimated Time**: 30-45 minutes  
**Difficulty**: Medium
