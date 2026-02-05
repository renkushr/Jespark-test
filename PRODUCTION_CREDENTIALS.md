# 🔐 Production Credentials

**วันที่:** 5 กุมภาพันธ์ 2026  
**สร้างโดย:** AI Assistant

---

## 🎯 JWT Secret (สร้างแล้ว)

```
25171e163ecb3a1fdc6b477c2fc0d9321155056b724741073c8cda7e0893f553138030d523cf11a43b94e4a1340f745074a0f06fe39b21a56da38c473df4ea23
```

**📋 Copy ค่านี้ไปใส่ใน Railway Environment Variables**

---

## 📦 Railway Environment Variables

**ไปที่:** https://railway.app/dashboard  
**Variables → RAW Editor → Paste:**

```env
PORT=5001
NODE_ENV=production
JWT_SECRET=25171e163ecb3a1fdc6b477c2fc0d9321155056b724741073c8cda7e0893f553138030d523cf11a43b94e4a1340f745074a0f06fe39b21a56da38c473df4ea23
SUPABASE_URL=YOUR_SUPABASE_URL_HERE
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_KEY_HERE
CORS_ORIGINS=http://localhost:3001
```

**⚠️ แก้ไข:**
1. `SUPABASE_URL` - ใส่ Supabase URL ของคุณ
2. `SUPABASE_SERVICE_KEY` - ใส่ Service Key ของคุณ

---

## 🎨 Netlify Environment Variables

**ไปที่:** https://netlify.com/dashboard  
**Site settings → Environment variables:**

```
Key: VITE_API_BASE_URL
Value: https://YOUR-RAILWAY-URL/api
```

**⚠️ แก้ไข:**
- `YOUR-RAILWAY-URL` - ใส่ Railway URL ที่ได้จาก Generate Domain

---

## 🔄 Update CORS (หลัง deploy Netlify)

**กลับไป Railway → Variables → แก้ไข `CORS_ORIGINS`:**

```env
CORS_ORIGINS=http://localhost:3001,https://YOUR-NETLIFY-URL
```

**⚠️ แก้ไข:**
- `YOUR-NETLIFY-URL` - ใส่ Netlify URL ที่ได้

---

## 📝 URLs Template

**จดไว้หลัง deploy:**

```
=== Production URLs ===

GitHub:
  Repo: https://github.com/renkushr/Jespark-test ✅
  Commit: 94169519 ✅

Railway:
  Dashboard: https://railway.app/dashboard
  Backend URL: https://[FILL_THIS_IN].up.railway.app
  API URL: https://[FILL_THIS_IN].up.railway.app/api

Netlify:
  Dashboard: https://netlify.com/dashboard
  Admin Panel: https://[FILL_THIS_IN].netlify.app

Supabase:
  Dashboard: https://supabase.com/dashboard
  Project URL: [FILL_THIS_IN]

=== Credentials ===

Admin Login:
  Username: admin
  Password: admin123
  (Change after first login!)

JWT Secret: 25171e163ecb3a1fdc6b477c2fc0d9321155056b724741073c8cda7e0893f553138030d523cf11a43b94e4a1340f745074a0f06fe39b21a56da38c473df4ea23

Date Created: 2026-02-05
```

---

## ✅ Checklist

- [x] ✅ Push to GitHub
- [ ] Deploy Backend to Railway
- [ ] Deploy Admin Panel to Netlify
- [ ] Update CORS
- [ ] Test everything
- [ ] Change admin password
- [ ] Document URLs above

---

**🎉 JWT Secret พร้อมใช้งาน!**

**Next:** Follow `DEPLOY_COPY_PASTE.md` Part 2 onwards
