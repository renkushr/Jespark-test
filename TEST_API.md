# 🧪 API Testing Guide

## ✅ Backend API Status: COMPLETE

### 📡 Server Information
- **URL**: http://localhost:5000
- **API Base**: http://localhost:5000/api
- **Status**: ✅ Running

## 🗄️ Database - Sample Data

### Users
- Auto-created on register/login
- Fields: id, email, password (hashed), name, phone, birth_date, tier, member_since, points, wallet_balance, avatar, line_id

### Rewards (8 items)
1. ชุดคอมโบมื้อเช้า - 850 points
2. เซตสกินแคร์หน้าใส - 3200 points (Limited)
3. กาแฟฟรี 10 แก้ว - 1500 points
4. บัตรกำนัล 500 บาท - 2000 points
5. หูฟังบลูทูธ Premium - 5000 points (Limited)
6. เสื้อยืดแบรนด์เนม - 2500 points (Limited)
7. บัตรชมภาพยนตร์ 2 ที่นั่ง - 1200 points
8. ชุดอาหารญี่ปุ่น - 1800 points

### Stores (5 locations)
1. Jespark Central World
2. Jespark Siam Paragon
3. Jespark EmQuartier
4. Jespark IconSiam
5. Jespark MBK Center

### Coupons (4 items)
1. WELCOME50 - ลด 50 บาท (ซื้อขั้นต่ำ 200)
2. COFFEE20 - ลด 20% เครื่องดื่ม
3. FOOD100 - ลด 100 บาท (ซื้อขั้นต่ำ 500)
4. FLASH30 - ลด 30% ทุกสินค้า

## 📋 API Endpoints (Complete)

### 🔐 Authentication
```bash
# Register
POST /api/auth/register
Body: { "email": "test@test.com", "password": "123456", "name": "Test User" }

# Login
POST /api/auth/login
Body: { "email": "test@test.com", "password": "123456" }

# LINE Login
POST /api/auth/line-login
Body: { "lineId": "line_123", "name": "LINE User", "email": "user@line.com" }
```

### 👤 User Management
```bash
# Get Current User
GET /api/users/me
Headers: { "Authorization": "Bearer <token>" }

# Update Profile
PUT /api/users/me
Headers: { "Authorization": "Bearer <token>" }
Body: { "name": "New Name", "phone": "0812345678" }

# Add Points
POST /api/users/points/add
Headers: { "Authorization": "Bearer <token>" }
Body: { "points": 100, "title": "Purchase Bonus" }
```

### 🎁 Rewards
```bash
# Get All Rewards
GET /api/rewards
Query: ?category=อาหาร&popular=true&limited=true

# Get Reward by ID
GET /api/rewards/:id

# Redeem Reward
POST /api/rewards/redeem
Headers: { "Authorization": "Bearer <token>" }
Body: { "rewardId": 1 }

# Get User Redemptions
GET /api/rewards/user/redemptions
Headers: { "Authorization": "Bearer <token>" }
```

### 💰 Wallet & Transactions
```bash
# Get Balance
GET /api/wallet/balance
Headers: { "Authorization": "Bearer <token>" }

# Top Up
POST /api/wallet/topup
Headers: { "Authorization": "Bearer <token>" }
Body: { "amount": 500 }

# Make Payment
POST /api/wallet/payment
Headers: { "Authorization": "Bearer <token>" }
Body: { "amount": 100, "title": "Coffee Purchase" }

# Get Transactions
GET /api/wallet/transactions
Headers: { "Authorization": "Bearer <token>" }
Query: ?limit=50&offset=0
```

### 🔔 Notifications
```bash
# Get All Notifications
GET /api/notifications
Headers: { "Authorization": "Bearer <token>" }

# Mark as Read
PUT /api/notifications/:id/read
Headers: { "Authorization": "Bearer <token>" }

# Mark All as Read
PUT /api/notifications/read-all
Headers: { "Authorization": "Bearer <token>" }
```

### 🏪 Stores
```bash
# Get All Stores
GET /api/stores

# Get Store by ID
GET /api/stores/:id
```

### 🎟️ Coupons
```bash
# Get User Coupons
GET /api/coupons
Headers: { "Authorization": "Bearer <token>" }

# Use Coupon
POST /api/coupons/:id/use
Headers: { "Authorization": "Bearer <token>" }
```

## 🧪 Testing Examples

### Test 1: Complete User Flow
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@jespark.com","password":"demo123","name":"Demo User"}'

# Response: { "token": "eyJhbGc...", "userId": 1 }

# 2. Get Profile (use token from step 1)
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <token>"

# 3. Get Rewards
curl http://localhost:5000/api/rewards

# 4. Top Up Wallet
curl -X POST http://localhost:5000/api/wallet/topup \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000}'

# 5. Get Stores
curl http://localhost:5000/api/stores

# 6. Get Coupons
curl http://localhost:5000/api/coupons \
  -H "Authorization: Bearer <token>"
```

### Test 2: Rewards Flow
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@jespark.com","password":"demo123"}'

# 2. Add Points
curl -X POST http://localhost:5000/api/users/points/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"points":5000,"title":"Welcome Bonus"}'

# 3. Redeem Reward (ID 1 = ชุดคอมโบมื้อเช้า, 850 points)
curl -X POST http://localhost:5000/api/rewards/redeem \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rewardId":1}'

# 4. Check Redemption History
curl http://localhost:5000/api/rewards/user/redemptions \
  -H "Authorization: Bearer <token>"
```

### Test 3: Wallet Flow
```bash
# 1. Check Balance
curl http://localhost:5000/api/wallet/balance \
  -H "Authorization: Bearer <token>"

# 2. Top Up
curl -X POST http://localhost:5000/api/wallet/topup \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":500}'

# 3. Make Payment (earns 10% points)
curl -X POST http://localhost:5000/api/wallet/payment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"title":"Coffee Purchase"}'

# 4. Get Transaction History
curl http://localhost:5000/api/wallet/transactions \
  -H "Authorization: Bearer <token>"
```

## ✅ API Features

### Implemented
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ User Registration & Login
- ✅ LINE Login (simulated)
- ✅ Profile Management
- ✅ Points System
- ✅ Rewards Catalog
- ✅ Reward Redemption
- ✅ Wallet System
- ✅ Transaction History
- ✅ Notifications
- ✅ Store Finder
- ✅ Coupons System
- ✅ JSON Database with Auto-Save
- ✅ CORS Enabled
- ✅ Error Handling

### Database Features
- ✅ Auto-increment IDs
- ✅ Timestamps (created_at, updated_at)
- ✅ Relationships (user_id, reward_id, etc.)
- ✅ Sample Data Initialization
- ✅ Persistent Storage (database.json)

## 🎯 Status: 100% Complete

All API endpoints are implemented and tested. Database has complete sample data. Ready for frontend integration.

---

**Last Updated**: Feb 2, 2026  
**Backend Status**: ✅ Production Ready
