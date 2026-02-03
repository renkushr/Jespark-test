# ⚡ Quick Start - Deploy Jespark Rewards

## 🚀 Deploy ใน 5 นาที

### 1. Setup โปรเจค (ครั้งแรก)

```bash
# Clone repository
git clone <your-repo-url>
cd jeslparknewlnw

# Run setup script (สร้าง .env files อัตโนมัติ)
npm run setup

# หรือติดตั้งด้วยตัวเอง:
npm install
cd server && npm install && cd ..
```

### 2. กำหนดค่า Environment Variables

#### Frontend (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_LIFF_ID=your_liff_id
VITE_APP_ENV=development
```

#### Backend (server/.env)
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_minimum_32_characters_long
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 3. ทดสอบ Local

```bash
# Terminal 1: Start Frontend
npm run dev

# Terminal 2: Start Backend
cd server
npm start
```

เปิดเบราว์เซอร์: http://localhost:3000

---

## 🌐 Deploy to Production

### Option 1: Vercel + Railway (แนะนำ)

#### A. Deploy Frontend to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

**Set Environment Variables in Vercel:**
- `VITE_API_BASE_URL` = `https://your-backend.railway.app/api`
- `VITE_LIFF_ID` = your LINE LIFF ID
- `VITE_APP_ENV` = `production`

#### B. Deploy Backend to Railway

1. ไปที่ https://railway.app
2. New Project → Deploy from GitHub
3. Select repository
4. Set Environment Variables:
   ```
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=<generate-new-secure-key>
   CORS_ORIGINS=https://your-frontend.vercel.app
   ADMIN_USERNAME=<your-username>
   ADMIN_PASSWORD=<secure-password>
   ```
5. Set Start Command: `npm start`
6. Set Root Directory: `server`
7. Deploy!

### Option 2: Netlify + Render

#### A. Deploy Frontend to Netlify

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod
```

#### B. Deploy Backend to Render

1. ไปที่ https://render.com
2. New Web Service
3. Connect GitHub
4. Build Command: `cd server && npm install`
5. Start Command: `cd server && npm start`
6. Add Environment Variables (same as Railway)
7. Deploy!

---

## 📋 Pre-Deployment Checklist

- [ ] **Security**
  - [ ] เปลี่ยน JWT_SECRET (ต้องยาวอย่างน้อย 32 ตัวอักษร)
  - [ ] เปลี่ยน ADMIN_PASSWORD
  - [ ] ตั้งค่า CORS_ORIGINS ให้ถูกต้อง
  - [ ] ลบ console.log ออกจาก production code

- [ ] **Environment Variables**
  - [ ] Frontend: VITE_API_BASE_URL ชี้ไปที่ production backend
  - [ ] Backend: NODE_ENV=production
  - [ ] ตรวจสอบ CORS_ORIGINS ให้ตรงกับ frontend URL

- [ ] **Database**
  - [ ] Backup database.json ก่อน deploy
  - [ ] พิจารณา migrate ไป Supabase (แนะนำสำหรับ production)

- [ ] **Testing**
  - [ ] ทดสอบ build locally: `npm run test:build`
  - [ ] ทดสอบ API endpoints ทั้งหมด
  - [ ] ทดสอบ user flows สำคัญ

---

## 🔧 Useful Commands

```bash
# Development
npm run dev              # Start frontend dev server
cd server && npm start   # Start backend server

# Production Build
npm run build            # Build frontend for production
npm run preview          # Preview production build

# Deployment
npm run deploy           # Interactive deployment script
npm run backup           # Backup database

# Testing
npm run test:build       # Build and preview locally
```

---

## 🚨 Common Issues

### 1. CORS Error
**Problem:** `Access-Control-Allow-Origin` error

**Solution:**
```bash
# เช็คว่า CORS_ORIGINS ใน server/.env มี frontend URL
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### 2. API Not Found (404)
**Problem:** Frontend ไม่เจอ Backend API

**Solution:**
```bash
# เช็คว่า VITE_API_BASE_URL ชี้ถูกที่
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

### 3. Database Error
**Problem:** `database.json` not found

**Solution:**
```bash
# ตรวจสอบว่า server/database.json มีอยู่
# หรือ setup Supabase สำหรับ production
```

### 4. JWT Error
**Problem:** Token verification failed

**Solution:**
```bash
# ตรวจสอบว่า JWT_SECRET มีความยาวอย่างน้อย 32 ตัวอักษร
# และเหมือนกันระหว่าง development และ production
JWT_SECRET=minimum_32_characters_long_secret_key_here
```

---

## 📊 Post-Deployment

### 1. Verify Deployment

```bash
# Test Frontend
curl https://your-frontend.vercel.app

# Test Backend API
curl https://your-backend.railway.app/

# Test specific endpoint
curl https://your-backend.railway.app/api/rewards
```

### 2. Monitor Logs

- **Vercel**: Dashboard → Your Project → Logs
- **Railway**: Dashboard → Your Service → Logs
- **Render**: Dashboard → Your Service → Logs

### 3. Test Critical Flows

- [ ] User Registration
- [ ] User Login
- [ ] LINE Login
- [ ] View Rewards
- [ ] Redeem Rewards
- [ ] View Wallet
- [ ] Admin Login
- [ ] Cashier System

---

## 🔐 Security Best Practices

1. **Never commit .env files**
   ```bash
   # Already in .gitignore
   .env
   .env.local
   .env.production
   server/.env
   ```

2. **Use strong passwords**
   - JWT_SECRET: 32+ characters
   - ADMIN_PASSWORD: Strong password

3. **HTTPS Only**
   - Vercel/Railway/Render enable HTTPS automatically
   - Never use HTTP in production

4. **Regular Backups**
   ```bash
   # Backup database
   npm run backup
   
   # Setup automated backups (cron)
   0 0 * * * cd /path/to/project && npm run backup
   ```

---

## 📚 Next Steps

1. **Database Migration**
   - Migrate จาก JSON file ไป Supabase/PostgreSQL
   - ดู guide ใน `PRODUCTION_READY_GUIDE.md`

2. **Monitoring**
   - Setup Sentry for error tracking
   - Setup analytics (Google Analytics, etc.)
   - Setup uptime monitoring (UptimeRobot)

3. **Performance**
   - Enable CDN for static assets
   - Implement caching
   - Add compression

4. **Testing**
   - Add unit tests
   - Add integration tests
   - Setup CI/CD pipeline

---

## 💡 Tips

- **Development**: ใช้ `npm run dev` กับ `cd server && npm start`
- **Testing**: ใช้ `npm run test:build` เพื่อทดสอบ production build locally
- **Deployment**: ใช้ `npm run deploy` สำหรับ interactive deployment
- **Backup**: ใช้ `npm run backup` เพื่อสำรองข้อมูลก่อน deploy

---

## 🆘 Need Help?

1. ดูเอกสารเพิ่มเติม: `PRODUCTION_READY_GUIDE.md`
2. ตรวจสอบ logs บน deployment platform
3. ตรวจสอบ environment variables
4. ทดสอบ locally ก่อน deploy

---

**สำเร็จ!** 🎉

ระบบของคุณพร้อม deploy แล้ว!

เริ่มต้นด้วย:
```bash
npm run setup
npm run dev
```

Deploy เมื่อพร้อมด้วย:
```bash
npm run deploy
```
