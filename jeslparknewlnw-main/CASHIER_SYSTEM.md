# 💰 ระบบแคชเชียร์ - Cashier System

## ✅ ระบบที่สร้างเสร็จแล้ว

### 🎯 ฟีเจอร์หลัก

1. **ค้นหาลูกค้า**
   - ค้นหาด้วยอีเมลหรือเบอร์โทรศัพท์
   - แสดงข้อมูลลูกค้าแบบเรียลไทม์
   - แสดงคะแนนสะสมปัจจุบัน

2. **คิดเงินและให้คะแนน**
   - คำนวณคะแนนอัตโนมัติ (10% ของยอดซื้อ)
   - อัปเดตคะแนนลูกค้าทันที
   - บันทึกประวัติการซื้อ
   - ส่งการแจ้งเตือนให้ลูกค้า

3. **Quick Amount Buttons**
   - ปุ่มจำนวนเงินด่วน (100, 500, 1000 บาท)
   - คำนวณคะแนนที่จะได้รับแบบเรียลไทม์

## 📱 Frontend - Cashier Screen

**ไฟล์**: `screens/Cashier.tsx`

### UI Components
- ✅ Search bar สำหรับค้นหาลูกค้า
- ✅ Customer info card
- ✅ Amount input with real-time points calculation
- ✅ Quick amount buttons
- ✅ Checkout button
- ✅ Success/Error messages
- ✅ Loading states

### Features
```typescript
// ค้นหาลูกค้า
const handleSearch = async () => {
  const response = await apiClient.searchCustomer(searchQuery);
  setCustomer(response.user);
}

// คิดเงิน
const handleCheckout = async () => {
  const response = await apiClient.cashierCheckout(customer.id, amount);
  // ลูกค้าได้รับคะแนน 10% ของยอดซื้อ
}
```

## 🔌 API Endpoints

**ไฟล์**: `server/routes/cashier.js`

### 1. Search Customer
```
GET /api/cashier/search?q={email_or_phone}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0812345678",
    "tier": "Platinum",
    "points": 5000,
    "walletBalance": 1500.00,
    "avatar": "https://..."
  }
}
```

### 2. Checkout (คิดเงินและให้คะแนน)
```
POST /api/cashier/checkout
Body: {
  "customerId": 1,
  "amount": 500
}
```

**Response:**
```json
{
  "message": "Checkout successful",
  "earnedPoints": 50,
  "totalPoints": 5050,
  "balance": 1500.00,
  "transaction": {
    "amount": 500,
    "points": 50,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Statistics (Optional)
```
GET /api/cashier/stats
```

**Response:**
```json
{
  "today": {
    "transactions": 45,
    "revenue": 12500,
    "pointsGiven": 1250,
    "customers": 32
  },
  "total": {
    "transactions": 1523,
    "customers": 245
  }
}
```

## 💡 Business Logic

### คะแนนที่ได้รับ
```javascript
earnedPoints = Math.floor(amount * 0.1)
// ซื้อ 500 บาท = ได้ 50 คะแนน (10%)
// ซื้อ 1000 บาท = ได้ 100 คะแนน (10%)
```

### Transaction Record
```javascript
{
  user_id: customerId,
  type: 'Payment',
  amount: 500,
  points: 50,
  title: 'Purchase at Store',
  subtitle: 'Cashier checkout - Earned 50 points',
  status: 'Completed',
  icon: 'shopping_bag'
}
```

### Notification
```javascript
{
  user_id: customerId,
  title: 'Purchase Completed!',
  message: 'You earned 50 points from your ฿500.00 purchase',
  category: 'General',
  is_unread: true
}
```

## 🎨 UI/UX Features

### Design
- ✅ Modern gradient design
- ✅ Real-time points calculation
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error handling
- ✅ Success feedback

### User Flow
1. แคชเชียร์เปิดหน้า Cashier
2. ค้นหาลูกค้าด้วยอีเมลหรือเบอร์โทร
3. ระบบแสดงข้อมูลลูกค้า
4. ใส่จำนวนเงิน (หรือเลือกจากปุ่มด่วน)
5. ระบบคำนวณคะแนนที่จะได้รับ
6. กดยืนยันการชำระเงิน
7. ลูกค้าได้รับคะแนนทันที
8. แสดงข้อความสำเร็จ

## 🔐 Security

### Protected Routes
- ✅ ต้อง login ก่อนใช้งาน (authenticateToken)
- ✅ Rate limiting (10 transactions/min)
- ✅ Input validation
- ✅ Amount validation (must be positive)

### Validation
```javascript
// Customer ID required
// Amount must be > 0
// Transaction limiter: 10/min
```

## 📊 Database Updates

### Tables Affected
1. **users** - อัปเดตคะแนน
2. **transactions** - บันทึกการซื้อ
3. **notifications** - ส่งการแจ้งเตือน

## 🚀 การใช้งาน

### เข้าสู่ระบบแคชเชียร์
1. เข้าสู่ระบบ Jespark Rewards
2. คลิกปุ่ม **Cashier** ที่หน้า Home (ปุ่มสีเขียวไล่เฉด)
3. หรือไปที่ `/cashier`

### ค้นหาลูกค้า
```
ค้นหาด้วย:
- อีเมล: user@example.com
- เบอร์โทร: 0812345678
```

### คิดเงิน
```
1. ใส่จำนวนเงิน
2. ดูคะแนนที่จะได้รับ (10%)
3. กดยืนยันการชำระเงิน
4. เสร็จสิ้น!
```

## 📱 Access Points

### Home Screen
- ปุ่ม **Cashier** (สีเขียวไล่เฉด)
- ตำแหน่ง: Quick Actions (แถวแรก)
- Icon: point_of_sale

### Direct URL
- `/cashier`

## 🧪 ทดสอบระบบ

### Test Flow
1. Login เข้าระบบ
2. ไปที่หน้า Cashier
3. ค้นหาลูกค้าด้วยอีเมลที่สมัครไว้
4. ใส่จำนวนเงิน 500 บาท
5. ตรวจสอบว่าคะแนนที่จะได้รับคือ 50 คะแนน
6. กดยืนยัน
7. ตรวจสอบว่าคะแนนเพิ่มขึ้น

### Test Cases
```bash
# 1. Search customer
GET /api/cashier/search?q=user@example.com

# 2. Checkout
POST /api/cashier/checkout
{
  "customerId": 1,
  "amount": 500
}

# 3. Verify points increased
GET /api/users/me
# Check points field
```

## ✅ Checklist

- ✅ Cashier screen UI
- ✅ Search customer API
- ✅ Checkout API
- ✅ Points calculation (10%)
- ✅ Transaction recording
- ✅ Notification sending
- ✅ Real-time updates
- ✅ Error handling
- ✅ Loading states
- ✅ Rate limiting
- ✅ Input validation
- ✅ Quick amount buttons
- ✅ Home screen button

## 🎯 Features Summary

**Frontend:**
- Cashier screen with search & checkout
- Real-time points calculation
- Quick amount buttons
- Success/Error feedback

**Backend:**
- Search customer endpoint
- Checkout endpoint
- Statistics endpoint (optional)
- Transaction recording
- Notification system

**Security:**
- Authentication required
- Rate limiting (10/min)
- Input validation
- Amount validation

---

**Status**: ✅ Complete  
**Last Updated**: Feb 2, 2026  
**Ready for**: Production Testing
