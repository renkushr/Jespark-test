# 🚀 Deploy MVP - Jespark Rewards (ขั้นตอนละเอียด)

**วันที่**: 3 กุมภาพันธ์ 2026  
**เป้าหมาย**: Deploy MVP ภายใน 30 นาที

---

## ✅ Pre-Deployment Checklist

ก่อน Deploy ให้ตรวจสอบสิ่งเหล่านี้ก่อน:

- ✅ Node.js v24.12.0 (Checked)
- ✅ npm v11.6.2 (Checked)
- [ ] มี GitHub account
- [ ] มี Vercel account (หรือสมัครฟรี)
- [ ] มี Railway account (หรือสมัครฟรี)
- [ ] Code อัพโหลดบน GitHub

---

## 🎯 ขั้นตอนที่ 1: ตรวจสอบและ Build Local

### 1.1 ตรวจสอบว่า dependencies ครบ

```bash
# ตรวจสอบ Frontend
npm list

# ตรวจสอบ Backend
cd server
npm list
cd ..
```

### 1.2 สร้าง Environment Files (ถ้ายังไม่มี)

**Frontend (.env.local)**
```bash
# สร้างไฟล์ .env.local
cat > .env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:5000/api
VITE_LIFF_ID=
VITE_APP_ENV=development
EOF
```

**Backend (server/.env)**
```bash
# สร้างไฟล์ server/.env
cat > server/.env << 'EOF'
PORT=5000
NODE_ENV=development
JWT_SECRET=jespark_rewards_secret_key_2024_production_minimum_32_chars
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOF
```

### 1.3 Test Build

```bash
# Build Frontend
npm run build

# ถ้า success จะเห็น folder 'dist' ถูกสร้าง
```

---

## 🎯 ขั้นตอนที่ 2: Push Code to GitHub

### 2.1 Initialize Git (ถ้ายังไม่มี)

```bash
git init
git add .
git commit -m "Initial commit - Ready for MVP deployment"
```

### 2.2 Create GitHub Repository

1. ไปที่ https://github.com/new
2. ตั้งชื่อ repository: `jespark-rewards`
3. เลือก **Private** (หรือ Public ตามต้องการ)
4. **อย่า** initialize with README (เพราะเรามีแล้ว)
5. คลิก "Create repository"

### 2.3 Push to GitHub

```bash
# เปลี่ยน <your-username> เป็น GitHub username ของคุณ
git remote add origin https://github.com/<your-username>/jespark-rewards.git
git branch -M main
git push -u origin main
```

---

## 🎯 ขั้นตอนที่ 3: Deploy Frontend to Vercel

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Login to Vercel

```bash
vercel login
# เลือก Continue with GitHub หรือ Email
```

### 3.3 Deploy

```bash
# Deploy แบบ interactive
vercel

# ตอบคำถาม:
# ? Set up and deploy? [Y/n] Y
# ? Which scope? [เลือก account ของคุณ]
# ? Link to existing project? [N]
# ? What's your project's name? jespark-rewards
# ? In which directory is your code located? ./
# ? Auto-detected Project Settings (Vite): [Y]
# ? Want to override? [n]

# Deploy to Production
vercel --prod
```

### 3.4 Configure Environment Variables

1. ไปที่ https://vercel.com/dashboard
2. เลือกโปรเจค `jespark-rewards`
3. Settings → Environment Variables
4. เพิ่ม:
   - **Key**: `VITE_API_BASE_URL`, **Value**: `http://localhost:5000/api` (จะอัพเดทหลัง deploy backend)
   - **Key**: `VITE_LIFF_ID`, **Value**: (ว่างไว้ก่อน)
   - **Key**: `VITE_APP_ENV`, **Value**: `production`

5. Redeploy:
```bash
vercel --prod
```

**Frontend URL**: https://jespark-rewards-xxx.vercel.app

---

## 🎯 ขั้นตอนที่ 4: Deploy Backend to Railway

### 4.1 Create Railway Account

1. ไปที่ https://railway.app
2. Sign up with GitHub
3. Authorize Railway

### 4.2 Create New Project

1. คลิก "New Project"
2. เลือก "Deploy from GitHub repo"
3. เลือก repository `jespark-rewards`
4. คลิก "Deploy Now"

### 4.3 Configure Service

1. **Root Directory**: คลิกที่ service → Settings → **Root Directory** = `server`
2. **Start Command**: Settings → **Start Command** = `npm start`
3. **Build Command**: (ไม่ต้องกำหนด จะใช้ `npm install` อัตโนมัติ)

### 4.4 Add Environment Variables

1. คลิกที่ service → Variables
2. เพิ่มตัวแปรเหล่านี้:

```
PORT=5000
NODE_ENV=production
JWT_SECRET=production_jwt_secret_key_minimum_32_characters_very_secure_change_this
CORS_ORIGINS=https://jespark-rewards-xxx.vercel.app
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecureP@ssw0rd!2024
```

**สำคัญ**: 
- เปลี่ยน `JWT_SECRET` เป็นค่าใหม่ที่ปลอดภัย
- เปลี่ยน `ADMIN_PASSWORD` เป็นรหัสผ่านที่แข็งแกร่ง
- เปลี่ยน `CORS_ORIGINS` เป็น URL ของ Vercel ที่ได้

### 4.5 Get Railway URL

1. ใน Railway dashboard → คลิกที่ service
2. Settings → **Generate Domain**
3. จะได้ URL แบบ: `https://jespark-rewards-production.up.railway.app`

**Backend URL**: Copy URL นี้ไว้

---

## 🎯 ขั้นตอนที่ 5: Update Frontend Environment

### 5.1 Update Vercel Environment Variables

1. กลับไปที่ Vercel Dashboard
2. Settings → Environment Variables
3. แก้ไข `VITE_API_BASE_URL`:
   - **Old**: `http://localhost:5000/api`
   - **New**: `https://jespark-rewards-production.up.railway.app/api`

4. Redeploy:
```bash
vercel --prod
```

---

## 🎯 ขั้นตอนที่ 6: Test MVP

### 6.1 Test Frontend

เปิดเบราว์เซอร์ไปที่ Vercel URL:
```
https://jespark-rewards-xxx.vercel.app
```

ทดสอบ:
- [ ] หน้า Login แสดงได้
- [ ] สมัครสมาชิกใหม่
- [ ] Login เข้าระบบ
- [ ] ดู Home screen
- [ ] ดู Rewards
- [ ] ดู Wallet

### 6.2 Test Backend API

ทดสอบ API ผ่าน Browser หรือ curl:

```bash
# Test API Health
curl https://jespark-rewards-production.up.railway.app/

# Test Register
curl -X POST https://jespark-rewards-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "0812345678"
  }'

# Test Login
curl -X POST https://jespark-rewards-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 6.3 Test Admin System

1. ไปที่ `https://jespark-rewards-xxx.vercel.app/#/admin/login`
2. Login ด้วย:
   - Username: `admin`
   - Password: (ที่ตั้งไว้ใน Railway)
3. ทดสอบ Cashier System

---

## 🎯 ขั้นตอนที่ 7: Monitor และ Verify

### 7.1 Check Logs

**Vercel Logs**:
1. Vercel Dashboard → Project → Logs
2. ดูว่ามี error หรือไม่

**Railway Logs**:
1. Railway Dashboard → Service → Logs
2. ดูว่า API ทำงานปกติ

### 7.2 Verify Database

```bash
# SSH to Railway (optional)
railway run bash

# หรือ check ผ่าน API
curl https://your-api.railway.app/api/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ✅ Success Checklist

เมื่อทำครบทุกขั้นตอน ควรมี:

- [ ] ✅ Frontend URL ใช้งานได้
- [ ] ✅ Backend API ตอบกลับได้
- [ ] ✅ Register/Login ทำงานได้
- [ ] ✅ Home screen โหลดได้
- [ ] ✅ Admin login ใช้งานได้
- [ ] ✅ Logs ไม่มี critical errors
- [ ] ✅ CORS configuration ถูกต้อง

---

## 🚨 Troubleshooting

### ปัญหา 1: CORS Error

**Error**: 
```
Access to fetch has been blocked by CORS policy
```

**แก้ไข**:
1. ไปที่ Railway → Variables
2. ตรวจสอบ `CORS_ORIGINS` มี Vercel URL หรือไม่
3. ตัวอย่าง: `CORS_ORIGINS=https://jespark-rewards-xxx.vercel.app`

### ปัญหา 2: API Not Found (404)

**Error**:
```
404 Not Found
```

**แก้ไข**:
1. ตรวจสอบ Vercel Environment Variables
2. `VITE_API_BASE_URL` ต้องมี `/api` ท้ายสุด
3. ตัวอย่าง: `https://your-api.railway.app/api`

### ปัญหา 3: Build Failed

**Error**:
```
Build failed with exit code 1
```

**แก้ไข**:
1. ลอง build local: `npm run build`
2. แก้ไข errors ที่เจอ
3. Commit และ push ใหม่

### ปัญหา 4: Railway Service Not Starting

**แก้ไข**:
1. Check Railway Logs
2. ตรวจสอบ Root Directory = `server`
3. ตรวจสอบ Start Command = `npm start`
4. ตรวจสอบว่า `server/package.json` มี `"start": "node server.js"`

---

## 📊 Post-Deployment Tasks

### ทันที (วันนี้)

1. **Test กับ users จริง**
   - เชิญเพื่อน 5-10 คน
   - ทดสอบลงทะเบียน + login
   - รวบรวม feedback

2. **Setup Monitoring**
   ```bash
   # Install Sentry (optional)
   npm install @sentry/react @sentry/node
   ```

3. **Backup Database**
   ```bash
   # Manual backup
   npm run backup
   ```

### สัปดาห์นี้

4. **Monitor Logs ทุกวัน**
   - Check Vercel logs
   - Check Railway logs
   - แก้ไข bugs ที่พบ

5. **Complete API Integration**
   - เชื่อมต่อ screens ที่เหลือ
   - ดู TODO: เชื่อมต่อ Frontend กับ Backend API ทั้ง 10 screens

### สัปดาห์หน้า

6. **Plan Database Migration**
   - สมัคร Supabase
   - Prepare migration script
   - ทดสอบใน staging environment

7. **Performance Optimization**
   - Image optimization
   - Code splitting
   - Add caching

---

## 💰 Cost Summary

### Free Tier (เพียงพอสำหรับ MVP)

**Vercel**:
- Bandwidth: 100GB/month
- Build time: 100 hours/month
- Cost: **$0/month**

**Railway**:
- $5 credit/month (free tier)
- Usage: ~$0.50-2/month
- Cost: **$0/month** (ภายใน credit)

**Total**: **$0/month** (สำหรับ 100-500 users)

### ถ้าเกิน Free Tier

**Vercel Pro**: $20/month
**Railway Hobby**: $5/month + usage (~$10-15/month)
**Total**: ~$30-40/month

---

## 📝 Important URLs

**Frontend**: https://jespark-rewards-xxx.vercel.app
**Backend**: https://jespark-rewards-production.up.railway.app
**Admin**: https://jespark-rewards-xxx.vercel.app/#/admin/login

**Dashboards**:
- Vercel: https://vercel.com/dashboard
- Railway: https://railway.app/dashboard
- GitHub: https://github.com/your-username/jespark-rewards

---

## 🎉 Congratulations!

คุณได้ Deploy MVP สำเร็จแล้ว! 🚀

**ขั้นตอนถัดไป**:
1. ทดสอบกับ users จริง
2. รวบรวม feedback
3. แก้ไข bugs
4. Complete API integration
5. Migrate database (1-2 สัปดาห์)
6. Full launch!

---

**Need Help?**
- 📖 [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)
- 📚 [PRODUCTION_READY_GUIDE.md](./PRODUCTION_READY_GUIDE.md)
- 📊 [SYSTEM_REVIEW_REPORT.md](./SYSTEM_REVIEW_REPORT.md)

**Good Luck!** 🍀
