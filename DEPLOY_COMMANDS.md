# 🚀 คำสั่ง Deploy MVP - ทีละขั้นตอน

**Status**: ✅ Build สำเร็จแล้ว (Frontend bundle: 464.88 KB)

---

## ✅ สิ่งที่เสร็จแล้ว

- ✅ Node.js v24.12.0 installed
- ✅ npm v11.6.2 installed  
- ✅ Frontend dependencies installed (148 packages)
- ✅ Backend dependencies installed (165 packages)
- ✅ **Build test passed!** (dist/index.html, dist/assets/)

---

## 🎯 ขั้นตอนถัดไป (เลือก Option)

### Option 1: Deploy ด้วย Vercel + Railway (แนะนำ) ⭐

#### A. Deploy Frontend to Vercel

```powershell
# 1. Install Vercel CLI (ครั้งแรกเท่านั้น)
npm install -g vercel

# 2. Login to Vercel
vercel login
# เลือก: Continue with GitHub / Email

# 3. Deploy (Test)
vercel

# 4. Deploy to Production
vercel --prod

# จะได้ URL: https://your-app.vercel.app
```

**Environment Variables ที่ต้องตั้งใน Vercel:**
```
VITE_API_BASE_URL = https://your-backend.up.railway.app/api
VITE_LIFF_ID = (ว่างไว้ก่อน หรือใส่ LINE LIFF ID)
VITE_APP_ENV = production
```

#### B. Deploy Backend to Railway

**ขั้นตอน:**

1. **สมัคร Railway**
   - ไปที่: https://railway.app
   - Sign up with GitHub
   - Authorize Railway

2. **Push Code to GitHub ก่อน** (ถ้ายังไม่มี)

```powershell
# Initialize git (ถ้ายังไม่มี)
git init
git add .
git commit -m "Ready for MVP deployment"

# Create repo on GitHub
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/jespark-rewards.git
git branch -M main
git push -u origin main
```

3. **Deploy on Railway**
   - Railway Dashboard → "New Project"
   - "Deploy from GitHub repo"
   - เลือก repository
   - Click service → Settings:
     - **Root Directory**: `server`
     - **Start Command**: `npm start`
   
4. **Add Environment Variables**

```
PORT = 5000
NODE_ENV = production
JWT_SECRET = production_secret_key_change_this_minimum_32_chars
CORS_ORIGINS = https://your-app.vercel.app
ADMIN_USERNAME = admin
ADMIN_PASSWORD = SecurePassword2024!
```

5. **Generate Domain**
   - Settings → Generate Domain
   - จะได้ URL: `https://your-app.up.railway.app`

6. **กลับไป Update Vercel**
   - Vercel Dashboard → Settings → Environment Variables
   - แก้ไข `VITE_API_BASE_URL` เป็น Railway URL + `/api`
   - Redeploy: `vercel --prod`

---

### Option 2: Deploy Manually (ถ้าไม่ต้องการ CLI)

#### A. Deploy Frontend to Vercel (Web UI)

1. **Upload to GitHub** (ตามขั้นตอนด้านบน)

2. **Import to Vercel**
   - ไปที่ https://vercel.com
   - "Add New" → "Project"
   - Import GitHub repository
   - Configure:
     - Framework Preset: **Vite**
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add Environment Variables (ตามด้านบน)
   - Deploy!

#### B. Deploy Backend to Railway (Web UI)

ทำตามขั้นตอนใน Option 1 - B

---

### Option 3: Test Local ก่อน Deploy

```powershell
# Terminal 1: Start Frontend (Development)
npm run dev
# จะเปิดที่ http://localhost:3000

# Terminal 2: Start Backend (ต้องเปิด terminal ใหม่)
cd server
npm start
# API จะอยู่ที่ http://localhost:5000

# Test ใน Browser:
# http://localhost:3000
```

---

## 📋 Environment Files Checklist

### Frontend (.env.local) - สำหรับ Local Development

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_LIFF_ID=
VITE_APP_ENV=development
```

### Frontend (Vercel) - สำหรับ Production

```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_LIFF_ID=your_liff_id
VITE_APP_ENV=production
```

### Backend (server/.env) - สำหรับ Local Development

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=jespark_rewards_secret_key_2024_production_minimum_32_chars
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Backend (Railway) - สำหรับ Production

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=production_secret_very_secure_change_this_32chars
CORS_ORIGINS=https://your-frontend.vercel.app
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword2024!
```

---

## 🔒 Security Checklist ก่อน Deploy

- [ ] เปลี่ยน `JWT_SECRET` (ต้องยาวอย่างน้อย 32 ตัวอักษร)
- [ ] เปลี่ยน `ADMIN_PASSWORD` (ใช้รหัสผ่านที่แข็งแกร่ง)
- [ ] ตั้งค่า `CORS_ORIGINS` ให้ถูกต้อง (เฉพาะ frontend URL ของคุณ)
- [ ] ตรวจสอบว่า `.gitignore` มี `.env` และ `server/.env`
- [ ] ตรวจสอบว่าไม่มี sensitive data ใน code

---

## ✅ Post-Deployment Testing

### 1. Test Frontend

```powershell
# เปิดเบราว์เซอร์ไปที่ Vercel URL
start https://your-app.vercel.app
```

**ทดสอบ:**
- [ ] หน้า Login แสดงได้
- [ ] สมัครสมาชิกใหม่ได้
- [ ] Login เข้าระบบได้
- [ ] Home screen โหลดได้
- [ ] ไม่มี CORS errors ใน console

### 2. Test Backend API

```powershell
# Test API Health
curl https://your-backend.railway.app/

# Test Register
curl -X POST https://your-backend.railway.app/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"

# Test Login
curl -X POST https://your-backend.railway.app/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### 3. Test Admin System

```
URL: https://your-app.vercel.app/#/admin/login
Username: admin
Password: (รหัสผ่านที่ตั้งไว้)
```

---

## 🚨 Common Issues

### Issue 1: CORS Error

**Error:**
```
Access-Control-Allow-Origin
```

**แก้ไข:**
- Railway → Variables → `CORS_ORIGINS` ต้องมี Vercel URL
- ต้องไม่มี trailing slash: `https://app.vercel.app` ✅ NOT `https://app.vercel.app/` ❌

### Issue 2: API Not Found

**Error:**
```
Failed to fetch / 404 Not Found
```

**แก้ไข:**
- Vercel → Environment Variables → `VITE_API_BASE_URL` ต้องมี `/api` ท้ายสุด
- ตัวอย่าง: `https://api.railway.app/api` ✅

### Issue 3: Build Failed

**Error:**
```
npm ERR! code ELIFECYCLE
```

**แก้ไข:**
```powershell
# ลบ node_modules และติดตั้งใหม่
rm -r node_modules
npm install

# Try build again
npm run build
```

---

## 📊 Expected Results

### ✅ Successful Deployment

**Frontend (Vercel):**
```
✓ Deployed to production
✓ URL: https://jespark-rewards-xxx.vercel.app
✓ Build time: ~30-60 seconds
✓ Bundle size: ~465 KB
```

**Backend (Railway):**
```
✓ Service running
✓ URL: https://jespark-rewards-production.up.railway.app
✓ Health check: ✅ {"status":"running"}
```

**Cost:**
```
Vercel: $0/month (Free tier)
Railway: $0-5/month (Free $5 credit)
Total: $0/month ✅
```

---

## 📞 Next Steps After Deploy

1. **ทดสอบกับ Real Users**
   - เชิญเพื่อน 5-10 คนทดสอบ
   - รวบรวม feedback
   - แก้ไข bugs

2. **Monitor Logs**
   - Vercel: https://vercel.com/dashboard → Logs
   - Railway: https://railway.app/dashboard → Logs
   - ตรวจสอบทุกวันในสัปดาห์แรก

3. **Setup Monitoring** (Optional)
   ```powershell
   # Install Sentry
   npm install @sentry/react @sentry/node
   ```

4. **Backup Database**
   ```powershell
   # Manual backup (local only for now)
   npm run backup
   ```

5. **Plan Next Phase**
   - Complete API integration (10 screens remaining)
   - Migrate to Supabase (ภายใน 1-2 สัปดาห์)
   - Add monitoring
   - Performance optimization

---

## 🎯 Quick Commands Summary

```powershell
# Setup (ทำแล้ว ✅)
npm install
cd server && npm install && cd ..

# Build Test (ทำแล้ว ✅)
npm run build

# Deploy Frontend
vercel --prod

# Test Local
npm run dev                    # Terminal 1
cd server && npm start        # Terminal 2

# Backup Database
npm run backup
```

---

## 📚 Documentation References

- **คู่มือ Deploy เต็ม**: [DEPLOY_NOW.md](./DEPLOY_NOW.md)
- **Quick Start**: [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)
- **Production Guide**: [PRODUCTION_READY_GUIDE.md](./PRODUCTION_READY_GUIDE.md)
- **System Report**: [SYSTEM_REVIEW_REPORT.md](./SYSTEM_REVIEW_REPORT.md)

---

## ✨ Ready to Deploy!

**ระบบพร้อมแล้ว!** คุณสามารถเลือก deploy ด้วย:

1. ⭐ **Vercel CLI** (เร็วที่สุด - 5 นาที)
2. 🌐 **Vercel Web UI** (ง่ายที่สุด - 10 นาที)
3. 🧪 **Test Local ก่อน** (ปลอดภัยที่สุด - 2 นาที)

**แนะนำ:** เริ่มจาก Option 3 (Test Local) เพื่อตรวจสอบว่าทุกอย่างทำงานได้ดี แล้วค่อย Deploy ด้วย Option 1

---

**Good Luck!** 🚀
