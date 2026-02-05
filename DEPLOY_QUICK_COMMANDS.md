# ⚡ Quick Deploy Commands

**คำสั่งด่วนสำหรับ Deploy**

---

## 🚀 Deploy ทั้งหมดใน 5 นาที

### 1. Push to GitHub

```bash
# ตรวจสอบ git status
git status

# Add all files
git add .

# Commit
git commit -m "Ready for production deployment"

# Push (ครั้งแรก)
git remote add origin https://github.com/YOUR_USERNAME/jespark-rewards.git
git branch -M main
git push -u origin main

# Push (ครั้งถัดไป)
git push
```

---

### 2. Supabase Setup

**SQL Commands (รันใน Supabase SQL Editor):**

```sql
-- Run entire schema.sql file
-- Or manually run these key tables:

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string',
  category VARCHAR(100) DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings (copy from schema.sql)
```

**Create Admin User:**

```bash
# After backend deployed, run:
curl -X POST https://YOUR-BACKEND-URL/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@jespark.com",
    "password": "admin123",
    "name": "Admin User"
  }'
```

---

### 3. Railway Deploy

**Environment Variables (Raw Editor):**

```env
PORT=5001
NODE_ENV=production
JWT_SECRET=CHANGE_THIS_TO_RANDOM_64_CHAR_STRING
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://YOUR-ADMIN-PANEL.netlify.app
```

**Generate Random JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Build Settings:**
- Root Directory: `/server`
- Build Command: `npm install`
- Start Command: `npm start`

---

### 4. Netlify Deploy

**Environment Variables:**

```env
VITE_API_BASE_URL=https://YOUR-BACKEND.up.railway.app/api
```

**Build Settings:**
- Base directory: `admin-panel`
- Build command: `npm run build`
- Publish directory: `admin-panel/dist`

---

## 🧪 Test Commands

### Test Backend:

```bash
# Health check
curl https://YOUR-BACKEND.up.railway.app/health

# Test API
curl https://YOUR-BACKEND.up.railway.app/api/settings
```

### Test Admin Panel:

```bash
# Just open in browser
https://YOUR-ADMIN-PANEL.netlify.app

# Login:
# Username: admin
# Password: admin123
```

---

## 🔄 Update Production

```bash
# 1. Make changes
# 2. Test locally
# 3. Push to GitHub

git add .
git commit -m "Update: [description]"
git push

# 4. Auto-deploy! (2-3 minutes)
```

---

## 📋 URLs Template

จดไว้ใช้งาน:

```
Database:
  URL: https://xxxxxxxxxxxxx.supabase.co
  Anon Key: eyJ...
  Service Key: eyJ...

Backend:
  Railway: https://jespark-backend-production-xxxx.up.railway.app
  API: https://jespark-backend-production-xxxx.up.railway.app/api

Admin Panel:
  Netlify: https://jespark-admin-xxxxx.netlify.app

Credentials:
  Admin Username: admin
  Admin Password: [CHANGE_THIS]
```

---

## ⚡ Super Quick Deploy (ถ้ามี repo แล้ว)

```bash
# 1. Supabase: Run schema.sql ✅
# 2. Railway: Connect repo → Set env vars → Deploy ✅
# 3. Netlify: Connect repo → Set env vars → Deploy ✅
# 4. Update CORS in Railway with Netlify URL ✅
# 5. Create admin user ✅
# 6. Test ✅
# 7. Done! 🎉
```

**เวลาที่ใช้:** 5-10 นาที

---

## 🔥 One-Line Deploys (future)

```bash
# Backend
railway up

# Admin Panel
netlify deploy --prod
```

---

## 🎯 Checklist

- [ ] Code on GitHub
- [ ] Supabase schema loaded
- [ ] Railway deployed
- [ ] Netlify deployed
- [ ] CORS updated
- [ ] Admin user created
- [ ] Tested login
- [ ] All pages work
- [ ] No console errors

✅ **Ready!**
