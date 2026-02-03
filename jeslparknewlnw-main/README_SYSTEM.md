# Jespark Rewards & Lifestyle - ระบบจริง

## 🎯 ภาพรวมระบบ

ระบบ Jespark Rewards เป็นแอปพลิเคชันสะสมคะแนนและกระเป๋าเงินดิจิทัล ที่มี Backend API แบบ RESTful และ Frontend ที่เชื่อมต่อกับ Backend จริง (ไม่ใช่ mockdata)

## 🏗️ สถาปัตยกรรมระบบ

### Backend (Node.js + Express)
- **Port**: 5000
- **Database**: JSON file-based database
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

### Frontend (React + TypeScript + Vite)
- **Port**: 3000
- **Routing**: React Router DOM
- **Styling**: TailwindCSS
- **State Management**: React Context API

## 📁 โครงสร้างโปรเจค

```
newlnw/
├── server/                    # Backend API
│   ├── routes/               # API Routes
│   │   ├── auth.js          # Authentication
│   │   ├── users.js         # User management
│   │   ├── rewards_new.js   # Rewards system
│   │   ├── wallet_new.js    # Wallet & transactions
│   │   ├── notifications_new.js
│   │   ├── stores_new.js
│   │   └── coupons_new.js
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   ├── database.js          # JSON database manager
│   ├── server.js            # Express server
│   ├── .env                 # Environment variables
│   └── package.json
│
├── src/                      # Frontend
│   ├── api/
│   │   └── client.ts        # API client
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── screens/             # 14 screens
│   └── components/
│
├── types.ts                 # TypeScript interfaces
└── App.tsx                  # Main app component
```

## 🚀 วิธีการรันระบบ

### 1. รัน Backend Server

```bash
cd server
npm install
npm start
```

Backend จะรันที่: **http://localhost:5000**

### 2. รัน Frontend

```bash
# ที่ root directory
npm install
npm run dev
```

Frontend จะรันที่: **http://localhost:3000**

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - ลงทะเบียนผู้ใช้ใหม่
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/line-login` - เข้าสู่ระบบผ่าน LINE

### User Management
- `GET /api/users/me` - ดึงข้อมูลผู้ใช้ปัจจุบัน
- `PUT /api/users/me` - อัปเดตโปรไฟล์
- `POST /api/users/points/add` - เพิ่มคะแนน

### Rewards
- `GET /api/rewards` - ดึงรายการของรางวัล
- `GET /api/rewards/:id` - ดึงข้อมูลของรางวัลตาม ID
- `POST /api/rewards/redeem` - แลกของรางวัล
- `GET /api/rewards/user/redemptions` - ดึงประวัติการแลกของรางวัล

### Wallet & Transactions
- `GET /api/wallet/balance` - ดึงยอดเงินคงเหลือ
- `POST /api/wallet/topup` - เติมเงิน
- `POST /api/wallet/payment` - ชำระเงิน
- `GET /api/wallet/transactions` - ดึงประวัติธุรกรรม

### Notifications
- `GET /api/notifications` - ดึงการแจ้งเตือน
- `PUT /api/notifications/:id/read` - ทำเครื่องหมายว่าอ่านแล้ว
- `PUT /api/notifications/read-all` - ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว

### Stores
- `GET /api/stores` - ดึงรายการสาขา
- `GET /api/stores/:id` - ดึงข้อมูลสาขาตาม ID

### Coupons
- `GET /api/coupons` - ดึงคูปองของผู้ใช้
- `POST /api/coupons/:id/use` - ใช้คูปอง

## 🔐 Authentication Flow

1. ผู้ใช้ลงทะเบียนหรือเข้าสู่ระบบ
2. Backend ส่ง JWT token กลับมา
3. Frontend เก็บ token ใน localStorage
4. ทุก API request จะส่ง token ใน Authorization header
5. Backend ตรวจสอบ token และอนุญาตการเข้าถึง

## 💾 Database Schema

### Users
```typescript
{
  id: number
  email: string
  password: string (hashed)
  name: string
  phone: string
  birth_date: string
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Member'
  member_since: string
  points: number
  wallet_balance: number
  avatar: string
  line_id: string (optional)
}
```

### Rewards
```typescript
{
  id: number
  title: string
  description: string
  points: number
  category: string
  image: string
  is_popular: boolean
  is_limited: boolean
  stock: number (-1 = unlimited)
}
```

### Transactions
```typescript
{
  id: number
  user_id: number
  type: 'Payment' | 'Top-up' | 'Rewards' | 'Redemption'
  amount: number
  points: number
  title: string
  subtitle: string
  status: string
  icon: string
  created_at: string
}
```

## 🎨 Features

### ✅ ที่ทำเสร็จแล้ว

1. **Backend API**
   - ✅ Authentication system (Register, Login, LINE Login)
   - ✅ User management
   - ✅ Points system
   - ✅ Rewards & redemption
   - ✅ Wallet & transactions
   - ✅ Notifications
   - ✅ Stores finder
   - ✅ Coupons system

2. **Frontend**
   - ✅ 14 หน้าจอครบถ้วน
   - ✅ API Client สำหรับเชื่อมต่อ Backend
   - ✅ Authentication Context
   - ✅ Modern UI/UX Design

3. **Database**
   - ✅ JSON file-based database
   - ✅ Sample data (8 rewards, 5 stores)
   - ✅ Auto-save mechanism

## 🔧 การพัฒนาต่อ

### ขั้นตอนถัดไป
1. เชื่อมต่อ Frontend screens กับ API
2. เพิ่ม error handling และ loading states
3. เพิ่ม form validation
4. ทดสอบระบบทั้งหมด
5. Deploy to production

### การปรับปรุงที่แนะนำ
- เปลี่ยนจาก JSON database เป็น PostgreSQL/MongoDB
- เพิ่ม rate limiting
- เพิ่ม API documentation (Swagger)
- เพิ่ม unit tests
- เพิ่ม CI/CD pipeline

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=jespark_rewards_secret_key_2026_secure
NODE_ENV=development
```

## 🐛 Troubleshooting

### Backend ไม่รัน
- ตรวจสอบว่าติดตั้ง dependencies แล้ว: `npm install`
- ตรวจสอบว่า port 5000 ว่าง
- ดู error logs ใน console

### Frontend ไม่เชื่อมต่อ Backend
- ตรวจสอบว่า Backend รันอยู่ที่ port 5000
- ตรวจสอบ CORS settings
- ตรวจสอบ API_BASE_URL ใน client.ts

### Database ไม่บันทึกข้อมูล
- ตรวจสอบ file permissions
- ตรวจสอบว่ามี database.json ถูกสร้างใน server/

## 📞 Support

สำหรับคำถามหรือปัญหา กรุณาติดต่อทีมพัฒนา

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: ✅ Backend Ready | 🔄 Frontend Integration In Progress
