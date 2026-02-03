# 🔄 Supabase Migration Status

## ✅ เสร็จแล้ว

### 1. **Setup & Configuration**
- ✅ ติดตั้ง `@supabase/supabase-js`
- ✅ สร้าง Supabase client (`server/config/supabase.js`)
- ✅ ตั้งค่า environment variables
- ✅ สร้าง database schema (9 tables)
- ✅ ทดสอบการเชื่อมต่อสำเร็จ

### 2. **Backend Routes - Migrated**
- ✅ **routes/auth.js** - Register, Login, LINE Login
- ✅ **routes/users.js** - Get profile, Update profile, Add points

---

## 🔄 กำลังทำ

### 3. **Backend Routes - In Progress**
- 🔄 **routes/rewards.js** - Get rewards, Redeem rewards
- ⏳ **routes/wallet.js** - Wallet, Transactions
- ⏳ **routes/notifications.js** - Notifications
- ⏳ **routes/stores.js** - Store locations
- ⏳ **routes/coupons.js** - Coupons
- ⏳ **routes/cashier.js** - Cashier system

---

## 📊 Progress

```
Setup:           ████████████████████ 100%
Auth Routes:     ████████████████████ 100%
User Routes:     ████████████████████ 100%
Rewards Routes:  ░░░░░░░░░░░░░░░░░░░░   0%
Wallet Routes:   ░░░░░░░░░░░░░░░░░░░░   0%
Other Routes:    ░░░░░░░░░░░░░░░░░░░░   0%
Overall:         ████████░░░░░░░░░░░░  40%
```

---

## 🎯 ขั้นตอนถัดไป

### ทำต่อเอง (แนะนำ)
คุณสามารถอัปเดต routes ที่เหลือเองได้ โดยใช้รูปแบบเดียวกับที่ฉันทำ:

#### Pattern การแปลง:

**จาก JSON database:**
```javascript
import db from '../database.js';

const user = db.users.find(u => u.id === userId);
const newUser = db.users.create({ name, email });
db.users.update(userId, { points: 100 });
```

**เป็น Supabase:**
```javascript
import supabase from '../config/supabase.js';

// Find
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

// Insert
const { data: newUser } = await supabase
  .from('users')
  .insert({ name, email })
  .select()
  .single();

// Update
await supabase
  .from('users')
  .update({ points: 100 })
  .eq('id', userId);
```

---

## 📝 ไฟล์ที่ต้องอัปเดต

### 1. routes/rewards.js
```javascript
// เปลี่ยน
import db from '../database.js';
// เป็น
import supabase from '../config/supabase.js';

// แปลง queries ทั้งหมด
```

### 2. routes/wallet.js
```javascript
// เปลี่ยน
import db from '../database.js';
// เป็น
import supabase from '../config/supabase.js';
```

### 3. routes/notifications.js
```javascript
// เปลี่ยน
import db from '../database.js';
// เป็น
import supabase from '../config/supabase.js';
```

### 4. routes/stores.js
```javascript
// เปลี่ยน
import db from '../database.js';
// เป็น
import supabase from '../config/supabase.js';
```

### 5. routes/coupons.js
```javascript
// เปลี่ยน
import db from '../database.js';
// เป็น
import supabase from '../config/supabase.js';
```

### 6. routes/cashier.js
```javascript
// เปลี่ยน
import db from '../database.js';
// เป็น
import supabase from '../config/supabase.js';
```

---

## 🔍 Supabase Query Patterns

### SELECT (ดึงข้อมูล)
```javascript
// Get all
const { data } = await supabase
  .from('rewards')
  .select('*');

// Get one
const { data } = await supabase
  .from('rewards')
  .select('*')
  .eq('id', rewardId)
  .single();

// Get with filter
const { data } = await supabase
  .from('rewards')
  .select('*')
  .eq('category', 'Food')
  .gt('stock', 0);

// Get with join
const { data } = await supabase
  .from('redemptions')
  .select(`
    *,
    rewards (*)
  `)
  .eq('user_id', userId);
```

### INSERT (เพิ่มข้อมูล)
```javascript
const { data, error } = await supabase
  .from('rewards')
  .insert({
    name: 'Coffee',
    points_required: 500
  })
  .select()
  .single();
```

### UPDATE (แก้ไขข้อมูล)
```javascript
const { data, error } = await supabase
  .from('users')
  .update({ points: 1000 })
  .eq('id', userId)
  .select()
  .single();
```

### DELETE (ลบข้อมูล)
```javascript
const { error } = await supabase
  .from('notifications')
  .delete()
  .eq('id', notificationId);
```

### COUNT (นับจำนวน)
```javascript
const { count } = await supabase
  .from('users')
  .select('*', { count: 'exact', head: true });
```

---

## 🧪 การทดสอบ

### ทดสอบแต่ละ endpoint:

```bash
# Test Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test Get Profile (ต้องมี token)
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ สิ่งที่ต้องระวัง

### 1. Error Handling
```javascript
// ✅ ถูกต้อง
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

if (error || !data) {
  return res.status(404).json({ error: 'User not found' });
}

// ❌ ผิด (ไม่ check error)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

### 2. Async/Await
```javascript
// ✅ ถูกต้อง
router.get('/me', authenticateToken, async (req, res) => {
  const { data } = await supabase.from('users').select('*');
});

// ❌ ผิด (ไม่มี async)
router.get('/me', authenticateToken, (req, res) => {
  const { data } = await supabase.from('users').select('*');
});
```

### 3. Column Names
```javascript
// Supabase ใช้ snake_case
{
  user_id: 1,
  created_at: '2026-02-02',
  wallet_balance: 100.00
}

// แต่ response ควรเป็น camelCase
{
  userId: 1,
  createdAt: '2026-02-02',
  walletBalance: 100.00
}
```

---

## 📚 Resources

- Supabase JS Docs: https://supabase.com/docs/reference/javascript
- SQL Editor: https://supabase.com/dashboard (SQL Editor tab)
- Table Editor: https://supabase.com/dashboard (Table Editor tab)

---

## ✅ Checklist

- [x] Setup Supabase
- [x] Create database schema
- [x] Test connection
- [x] Migrate auth routes
- [x] Migrate users routes
- [ ] Migrate rewards routes
- [ ] Migrate wallet routes
- [ ] Migrate notifications routes
- [ ] Migrate stores routes
- [ ] Migrate coupons routes
- [ ] Migrate cashier routes
- [ ] Test all endpoints
- [ ] Remove old database.js
- [ ] Update documentation

---

**Status**: 40% Complete  
**Next**: Migrate remaining routes (rewards, wallet, notifications, stores, coupons, cashier)
