# ⚙️ ตั้งค่า Environment Variables

**สำคัญ:** ต้องตั้งค่าไฟล์ `.env` ก่อนรันระบบ

---

## 📝 ไฟล์ที่ต้องสร้าง

### 1. `server/.env` (Backend)

```bash
cd server
```

สร้างไฟล์ `.env` ด้วยเนื้อหา:

```env
# Server Port
PORT=5001

# Database Configuration (Supabase)
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# CORS Origins (comma separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173

# Node Environment
NODE_ENV=development
```

**ตัวอย่างค่าจริง:**
```env
PORT=5001
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=my_super_secret_jwt_key_12345
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
NODE_ENV=development
```

---

### 2. `admin-panel/.env` (Admin Panel)

```bash
cd admin-panel
```

สร้างไฟล์ `.env` ด้วยเนื้อหา:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## 🚀 วิธีรันระบบ

### Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Admin Panel
cd admin-panel
npm install
```

---

### Step 2: สร้างไฟล์ .env (ถ้ายังไม่ได้สร้าง)

```bash
# Backend
cd server
# สร้างไฟล์ .env ตามตัวอย่างด้านบน

# Admin Panel
cd admin-panel
# สร้างไฟล์ .env ตามตัวอย่างด้านบน
```

---

### Step 3: Run Backend

```bash
cd server
npm start
```

**Expected Output:**
```
📡 Server running on http://localhost:5001
🔗 API Base URL: http://localhost:5001/api
✅ Database connected successfully
```

---

### Step 4: Run Admin Panel (Terminal ใหม่)

```bash
cd admin-panel
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3001/
```

---

### Step 5: เปิด Browser

```
http://localhost:3001
```

---

## 🔑 ข้อมูล Admin Login เริ่มต้น

ถ้ายังไม่มี admin account, ให้สร้างผ่าน API:

```bash
curl -X POST http://localhost:5001/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@jespark.com",
    "password": "admin123",
    "name": "Admin User"
  }'
```

**หรือใช้ Postman:**
- Method: `POST`
- URL: `http://localhost:5001/api/auth/admin/register`
- Body (JSON):
```json
{
  "username": "admin",
  "email": "admin@jespark.com",
  "password": "admin123",
  "name": "Admin User"
}
```

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

---

## 🐛 Troubleshooting

### ปัญหา 1: Backend ไม่ start

**Error:**
```
Error: Missing SUPABASE_URL
```

**แก้ไข:**
- เช็คว่ามีไฟล์ `server/.env`
- เช็คว่ามี `SUPABASE_URL` และ `SUPABASE_SERVICE_KEY`

---

### ปัญหา 2: Admin Panel ไม่เชื่อม Backend

**Error:**
```
Access to fetch has been blocked by CORS policy
```

**แก้ไข:**
- เช็คว่า Backend มี `CORS_ORIGINS` รวม `localhost:3001`
- Restart Backend

---

### ปัญหา 3: ไม่มี VITE_API_BASE_URL

**Error:**
```
API calls go to wrong URL
```

**แก้ไข:**
- สร้างไฟล์ `admin-panel/.env`
- ใส่ `VITE_API_BASE_URL=http://localhost:5001/api`
- Restart Admin Panel

---

## ✅ ตรวจสอบว่าทำงานหรือไม่

### 1. เช็ค Backend

```bash
curl http://localhost:5001/api/auth/verify
```

ควรได้:
```json
{
  "error": "No token provided"
}
```
(นี่ถูกต้อง เพราะไม่ได้ส่ง token)

---

### 2. เช็ค Admin Panel

เปิด Browser Console ที่ `http://localhost:3001`

ไม่ควรเห็น CORS errors ✅

---

### 3. ทดสอบ Login

1. กรอก username: `admin`
2. กรอก password: `admin123`
3. คลิก Login
4. ✅ ควร redirect to Dashboard

---

## 📋 Summary

**ไฟล์ที่ต้องสร้าง:**
1. ✅ `server/.env`
2. ✅ `admin-panel/.env`

**Commands:**
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Admin Panel
cd admin-panel
npm run dev
```

**URLs:**
- Backend: http://localhost:5001
- Admin Panel: http://localhost:3001

---

**🎉 ตั้งค่าเสร็จแล้ว! พร้อมใช้งาน** 🚀
