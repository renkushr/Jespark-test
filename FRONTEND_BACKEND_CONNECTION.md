# 🔗 การเชื่อมต่อ Frontend ↔️ Backend

**วันที่:** 5 กุมภาพันธ์ 2026  
**สถานะ:** ✅ แก้ไขเรียบร้อย - พร้อมใช้งาน

---

## 📊 ภาพรวมระบบ

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  👥 User/Admin                                      │
│                                                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ เข้าถึงผ่าน Browser
                  │
    ┌─────────────┴─────────────┐
    │                           │
    ▼                           ▼
┌─────────────┐          ┌──────────────┐
│  Frontend   │          │ Admin Panel  │
│   (Main)    │          │   (Admin)    │
│  Port 3000  │          │  Port 3001   │
│   React     │          │    React     │
└──────┬──────┘          └──────┬───────┘
       │                        │
       │ HTTP Requests          │ HTTP Requests
       │ (API Calls)            │ (API Calls)
       │                        │
       └────────┬───────────────┘
                │
                ▼
        ┌───────────────┐
        │   Backend     │
        │  (Server)     │
        │  Port 5001    │
        │   Node.js     │
        │   Express     │
        └───────┬───────┘
                │
                │ Database Queries
                │
                ▼
        ┌───────────────┐
        │   Supabase    │
        │  PostgreSQL   │
        └───────────────┘
```

---

## 🔧 Configuration

### 1. **Backend (Server)** 

**Port:** `5001`  
**Base URL:** `http://localhost:5001/api`  
**File:** `server/server.js`

```javascript
const PORT = process.env.PORT || 5001;
```

**CORS Configuration:**
```javascript
const corsOrigins = [
  'http://localhost:3000',      // Main Frontend
  'http://127.0.0.1:3000',
  'http://localhost:5173',      // Vite default
  'http://localhost:3001',      // Admin Panel ✅ (เพิ่มใหม่)
  'http://127.0.0.1:3001'       // Admin Panel (127.0.0.1)
];
```

**Routes:**
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cashier', cashierRoutes);
app.use('/api/admin', adminRoutes);
```

---

### 2. **Frontend - Main App**

**Port:** `3000` (default)  
**Tech:** React + Vite  
**API Base:** `http://localhost:5001/api`

---

### 3. **Admin Panel**

**Port:** `3001`  
**Tech:** React + Vite  
**File:** `admin-panel/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,  // Admin Panel port
    host: true
  }
})
```

**Environment Variables:**  
**File:** `admin-panel/.env`

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

**Usage in Code:**
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Example:
fetch(`${API_BASE}/admin/stats`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
})
```

---

## 🐛 ปัญหาที่พบและแก้ไข

### ❌ ปัญหาเดิม

**Admin Panel ไม่สามารถเชื่อมต่อ Backend ได้**

**Error Message:**
```
Access to fetch at 'http://localhost:5001/api/...' from origin 'http://localhost:3001' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

**สาเหตุ:**
- Backend CORS อนุญาตเฉพาะ `localhost:3000` และ `localhost:5173`
- Admin Panel ทำงานที่ `localhost:3001` แต่ไม่ได้อยู่ใน whitelist

---

### ✅ วิธีแก้ไข

**1. เพิ่ม Admin Panel port ใน CORS whitelist**

แก้ไขไฟล์ `server/server.js`:

```javascript
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : [
      'http://localhost:3000',      // Main Frontend
      'http://127.0.0.1:3000',
      'http://localhost:5173',      // Vite default
      'http://localhost:3001',      // Admin Panel ✅ เพิ่มบรรทัดนี้
      'http://127.0.0.1:3001'       // Admin Panel (127.0.0.1)
    ];
```

**2. สร้างไฟล์ `.env` สำหรับ Admin Panel**

สร้างไฟล์ `admin-panel/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

**3. (Optional) ตั้งค่า CORS ใน server/.env**

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
```

---

## 🧪 วิธีทดสอบการเชื่อมต่อ

### Step 1: Start Backend

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

### Step 2: Start Admin Panel

```bash
cd admin-panel
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3001/
➜  Network: use --host to expose
```

---

### Step 3: ทดสอบการเชื่อมต่อ

**3.1 เปิด Browser Console**

ไปที่ `http://localhost:3001`

**3.2 ทดสอบ Login**

1. กรอก Username/Password
2. คลิก Login
3. ✅ ถ้าสำเร็จ → redirect to Dashboard
4. ❌ ถ้าล้มเหลว → เช็ค Console

**3.3 ทดสอบ API Call**

เปิด Browser DevTools → Network Tab:

```
Request URL: http://localhost:5001/api/auth/admin/login
Request Method: POST
Status Code: 200 OK (ถ้าสำเร็จ)

Response Headers:
  Access-Control-Allow-Origin: http://localhost:3001 ✅
  Content-Type: application/json
```

---

### Step 4: ทดสอบทุกหน้า

1. **Dashboard** → ดึงข้อมูล stats
2. **Cashier** → ค้นหาลูกค้า + checkout
3. **Customers** → โหลดรายชื่อลูกค้า
4. **Points** → ดึงประวัติคะแนน
5. **Rewards** → โหลดรายการของรางวัล
6. **Reports** → ดึงข้อมูล reports

**ทุกหน้าควรทำงานได้ไม่มี CORS error ✅**

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   Admin     │
│   Login     │
└──────┬──────┘
       │
       │ POST /api/auth/admin/login
       │ { username, password }
       │
       ▼
┌──────────────┐
│   Backend    │
│   Validate   │
└──────┬───────┘
       │
       │ Generate JWT Token
       │
       ▼
┌──────────────┐
│   Frontend   │
│ Store Token  │
│ (localStorage)│
└──────┬───────┘
       │
       │ Subsequent Requests
       │ Header: Authorization: Bearer <token>
       │
       ▼
┌──────────────┐
│   Backend    │
│ Verify Token │
└──────┬───────┘
       │
       ▼
   ✅ Success / ❌ Unauthorized
```

**Token Storage:**
```javascript
// Login success
localStorage.setItem('admin_token', response.token);

// API calls
headers: {
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
}
```

---

## 📡 API Endpoints

### Admin Authentication
```
POST   /api/auth/admin/login
POST   /api/auth/admin/register
GET    /api/auth/admin/verify
```

### Cashier
```
GET    /api/cashier/search?q=<query>
POST   /api/cashier/checkout
POST   /api/cashier/checkout-with-points
GET    /api/cashier/transactions
POST   /api/cashier/refund/:id
GET    /api/cashier/stats
GET    /api/cashier/my-summary
```

### Admin - Users
```
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
```

### Admin - Points
```
GET    /api/admin/points/history
POST   /api/admin/points/deduct
POST   /api/admin/points/bulk-add
GET    /api/admin/points/expiring
PUT    /api/admin/points/expiry/:id
GET    /api/admin/points/export
```

### Admin - Rewards
```
GET    /api/rewards
GET    /api/admin/rewards
POST   /api/admin/rewards
PUT    /api/admin/rewards/:id
DELETE /api/admin/rewards/:id
```

### Admin - Reports
```
GET    /api/admin/reports/sales
GET    /api/admin/reports/members
GET    /api/admin/reports/points
GET    /api/admin/reports/redemptions
```

---

## 🚨 Common Errors & Solutions

### 1. CORS Error

**Error:**
```
Access to fetch has been blocked by CORS policy
```

**Solution:**
- ✅ เช็คว่า Backend CORS อนุญาต `localhost:3001`
- ✅ เช็คว่า Backend ทำงานอยู่
- ✅ Restart Backend หลังแก้ CORS

---

### 2. Network Error

**Error:**
```
Failed to fetch
TypeError: NetworkError when attempting to fetch resource
```

**Solution:**
- ✅ เช็คว่า Backend ทำงานอยู่ (port 5001)
- ✅ เช็ค URL ใน `.env` ถูกต้อง
- ✅ เช็ค Firewall/Antivirus

---

### 3. 401 Unauthorized

**Error:**
```
Status: 401 Unauthorized
```

**Solution:**
- ✅ Login ใหม่
- ✅ เช็ค Token ใน localStorage
- ✅ Token หมดอายุ → ต้อง login ใหม่

---

### 4. 404 Not Found

**Error:**
```
Status: 404 Not Found
```

**Solution:**
- ✅ เช็ค API endpoint ถูกต้อง
- ✅ เช็คว่า route มีอยู่ใน `server.js`
- ✅ เช็ค URL spelling

---

## ✅ Checklist

- [x] Backend ทำงานที่ port 5001
- [x] Admin Panel ทำงานที่ port 3001
- [x] CORS อนุญาต `localhost:3001`
- [x] `.env` สร้างแล้ว (`admin-panel/.env`)
- [x] `VITE_API_BASE_URL` ตั้งค่าถูกต้อง
- [x] Authentication ทำงาน
- [x] API endpoints ทำงาน
- [x] ไม่มี CORS errors
- [x] ทดสอบทุกหน้าแล้ว

---

## 🎉 สรุป

**✅ Frontend และ Backend เชื่อมต่อกันได้แล้ว!**

### สิ่งที่แก้ไข:
1. ✅ เพิ่ม `localhost:3001` ใน CORS whitelist
2. ✅ สร้างไฟล์ `.env` สำหรับ Admin Panel
3. ✅ ตั้งค่า `VITE_API_BASE_URL`

### วิธีใช้งาน:
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Admin Panel
cd admin-panel
npm run dev

# เปิด Browser: http://localhost:3001
```

### Expected Result:
- ✅ Login ได้
- ✅ Dashboard โหลดข้อมูลได้
- ✅ ทุกหน้าทำงาน
- ✅ ไม่มี CORS errors
- ✅ API calls สำเร็จ

---

**🎊 พร้อมใช้งานแล้ว!** 💪

**ลองทดสอบได้เลย:**
```bash
cd server && npm start
# เปิด Terminal ใหม่
cd admin-panel && npm run dev
```

**เข้าที่:** http://localhost:3001 🚀
