# 📋 แผนการพัฒนา Admin Panel ให้ใช้งานได้จริงทั้งหมด

**วันที่:** 5 กุมภาพันธ์ 2026  
**Project:** Jespark Rewards & Lifestyle Admin Panel  
**เป้าหมาย:** ทำให้ทุกหน้าใช้งานได้จริง 100%

---

## 📊 สถานะปัจจุบัน

### Pages ที่มี (9 หน้า)

| หน้า | สถานะ UI | เชื่อม API | ใช้งานได้ | Priority |
|------|----------|------------|----------|----------|
| **Login** | ✅ Complete | ✅ Yes | ✅ 100% | - |
| **Dashboard** | ✅ Complete | 🟡 Partial | 🟡 70% | 🔴 High |
| **Cashier** | ✅ Complete | ✅ Yes | ✅ 100% | - |
| **Customers** | ✅ Complete | ✅ Yes | ✅ 90% | 🟡 Medium |
| **CustomerDetail** | ✅ Complete | 🟡 Partial | 🟡 60% | 🟡 Medium |
| **Points** | ✅ Complete | ✅ Yes | ✅ 80% | 🟡 Medium |
| **Rewards** | ✅ Complete | 🟡 Partial | 🟡 70% | 🔴 High |
| **Reports** | ⚠️ Placeholder | ❌ No | ❌ 0% | 🔴 High |
| **Settings** | ⚠️ Placeholder | ❌ No | ❌ 0% | 🟢 Low |

### สรุปสถานะ
- ✅ **ใช้งานได้แล้ว 100%**: 2 หน้า (Login, Cashier)
- 🟡 **ใช้งานได้บางส่วน**: 5 หน้า (Dashboard, Customers, CustomerDetail, Points, Rewards)
- ❌ **ยังไม่ได้พัฒนา**: 2 หน้า (Reports, Settings)

**Progress รวม: 60%**

---

## 🎯 สิ่งที่ต้องทำ (To-Do List)

### 🔴 Priority 1: Critical (ต้องทำก่อน)

#### 1. **Reports Page** ❌ (0% → 100%)

**ความสำคัญ:** สูงมาก - เป็นหน้าหลักสำหรับการดูรายงาน

**ฟีเจอร์ที่ต้องมี:**
- 📊 Sales Report (รายงานยอดขาย)
  - รายวัน, รายสัปดาห์, รายเดือน, รายปี
  - กราฟแสดงยอดขาย (Line Chart)
  - ตารางรายละเอียด
  
- 👥 Members Report (รายงานสมาชิก)
  - จำนวนสมาชิกใหม่
  - กราฟการเติบโต (Area Chart)
  - แบ่งตาม Tier
  
- ⭐ Points Report (รายงานคะแนน)
  - คะแนนที่แจกทั้งหมด
  - คะแนนที่ใช้ไป
  - Top 10 ลูกค้าที่มีคะแนนมากที่สุด
  
- 🎁 Redemptions Report (รายงานการแลกของรางวัล)
  - จำนวนการแลก
  - ของรางวัลยอดนิยม
  - มูลค่ารวม
  
- 📥 Export Functions
  - Export เป็น PDF
  - Export เป็น Excel
  - Export เป็น CSV

**Backend APIs ที่ต้องเพิ่ม:**
```
GET  /api/admin/reports/sales
GET  /api/admin/reports/members  
GET  /api/admin/reports/points
GET  /api/admin/reports/redemptions
GET  /api/admin/reports/export/:type
```

**Timeline:** 3-4 วัน

---

#### 2. **Dashboard - Complete Analytics** 🟡 (70% → 100%)

**ความสำคัญ:** สูง - หน้าแรกที่ admin เห็น

**ฟีเจอร์ที่ต้องเพิ่ม:**
- 📈 Charts ที่มีข้อมูลจริง
  - Revenue Chart (ยอดขาย 7 วันล่าสุด)
  - Members Growth Chart (สมาชิกใหม่ 30 วันล่าสุด)
  - Points Distribution Chart (การกระจายคะแนน)
  
- 📊 Real-time Stats
  - อัปเดตสถิติแบบ real-time
  - ยอดขายวันนี้
  - สมาชิกใหม่วันนี้
  
- 🔔 Recent Activities
  - แสดงกิจกรรมล่าสุด 10 รายการ
  - การสมัครสมาชิกใหม่
  - การซื้อสินค้า
  - การแลกของรางวัล
  
- ⚠️ Alerts & Notifications
  - ของรางวัลใกล้หมด
  - สมาชิกที่ไม่ได้ใช้งานนาน
  - ยอดขายผิดปกติ

**Backend APIs ที่ต้องเพิ่ม:**
```
GET  /api/admin/dashboard/charts/revenue
GET  /api/admin/dashboard/charts/members
GET  /api/admin/dashboard/charts/points
GET  /api/admin/dashboard/activities/recent
GET  /api/admin/dashboard/alerts
```

**Timeline:** 2-3 วัน

---

#### 3. **Rewards Management - Complete CRUD** 🟡 (70% → 100%)

**ความสำคัญ:** สูง - จัดการของรางวัลทั้งหมด

**ฟีเจอร์ที่ต้องปรับปรุง:**
- ✅ Create Reward - มีแล้ว
- ✅ Update Reward - มีแล้ว
- ✅ Delete Reward - มีแล้ว
- ➕ **ต้องเพิ่ม:**
  - Toggle Active/Inactive
  - Bulk Actions (เลือกหลายรายการ)
  - Upload Image (แทน URL)
  - Stock Management
  - Redemption History per Reward
  - Category Management

**Backend APIs ที่ต้องเพิ่ม:**
```
PUT    /api/admin/rewards/:id/toggle-status
POST   /api/admin/rewards/bulk-delete
POST   /api/admin/rewards/upload-image
GET    /api/admin/rewards/:id/redemptions
GET    /api/admin/categories
POST   /api/admin/categories
```

**Timeline:** 2 วัน

---

### 🟡 Priority 2: Important (ทำตาม)

#### 4. **Customer Detail Page** 🟡 (60% → 100%)

**ความสำคัญ:** ปานกลาง - ดูข้อมูลลูกค้าแต่ละคน

**ฟีเจอร์ที่ต้องเพิ่ม:**
- 👤 Customer Profile
  - ข้อมูลพื้นฐาน (มีแล้ว)
  - แก้ไขข้อมูล
  - ยกเลิกสมาชิก
  - Reset Password
  
- 📜 Transaction History
  - ประวัติการซื้อทั้งหมด
  - ตัวกรอง (วันที่, ประเภท)
  - รายละเอียดแต่ละ transaction
  
- ⭐ Points History
  - ประวัติการได้รับคะแนน
  - ประวัติการใช้คะแนน
  - กราฟคะแนน
  
- 🎁 Redemption History
  - ของรางวัลที่แลกไป
  - สถานะการแลก
  - วันที่แลก

**Backend APIs ที่ต้องเพิ่ม:**
```
GET    /api/admin/customers/:id/transactions
GET    /api/admin/customers/:id/points-history
GET    /api/admin/customers/:id/redemptions
PUT    /api/admin/customers/:id
DELETE /api/admin/customers/:id
POST   /api/admin/customers/:id/reset-password
```

**Timeline:** 2-3 วัน

---

#### 5. **Points Management - Enhanced** 🟡 (80% → 100%)

**ความสำคัญ:** ปานกลาง - จัดการคะแนนของลูกค้า

**ฟีเจอร์ที่ต้องเพิ่ม:**
- ✅ Add Points - มีแล้ว
- ➕ **ต้องเพิ่ม:**
  - Deduct Points (หักคะแนน)
  - Bulk Points Addition
  - Points Expiry Management
  - Points Report Export
  - Search & Filter History

**Backend APIs ที่ต้องเพิ่ม:**
```
POST   /api/admin/points/deduct
POST   /api/admin/points/bulk-add
GET    /api/admin/points/expiring
PUT    /api/admin/points/expiry/:id
GET    /api/admin/points/export
```

**Timeline:** 1-2 วัน

---

#### 6. **Customers Page - Enhanced** 🟡 (90% → 100%)

**ความสำคัญ:** ปานกลาง - จัดการลูกค้าทั้งหมด

**ฟีเจอร์ที่ต้องเพิ่ม:**
- ✅ List Customers - มีแล้ว
- ✅ Search - มีแล้ว
- ✅ Filter by Tier - มีแล้ว
- ➕ **ต้องเพิ่ม:**
  - Advanced Filters
    - Date Range
    - Points Range
    - Active/Inactive
  - Bulk Actions
    - Bulk Delete
    - Bulk Tier Update
    - Bulk Email
  - Export Customers
  - Import Customers (CSV)
  - Pagination ที่เป็น real

**Backend APIs ที่ต้องเพิ่ม:**
```
POST   /api/admin/customers/bulk-delete
POST   /api/admin/customers/bulk-update-tier
POST   /api/admin/customers/bulk-email
GET    /api/admin/customers/export
POST   /api/admin/customers/import
```

**Timeline:** 2 วัน

---

### 🟢 Priority 3: Nice to Have (ทำถ้ามีเวลา)

#### 7. **Settings Page** ⚠️ (0% → 100%)

**ความสำคัญ:** ต่ำ - การตั้งค่าระบบ

**ฟีเจอร์ที่ต้องมี:**
- ⚙️ General Settings
  - Site Name
  - Logo Upload
  - Contact Information
  - Business Hours
  
- 💰 Points Settings
  - Points per Baht
  - Minimum Points to Redeem
  - Points Expiry Days
  
- 💳 Payment Settings
  - Payment Methods
  - Currency
  - Tax Rate
  
- 📧 Email Settings
  - SMTP Configuration
  - Email Templates
  - Notification Settings
  
- 👥 Admin Users Management
  - List Admin Users
  - Add/Edit/Delete Admin
  - Roles & Permissions
  
- 🔐 Security Settings
  - Change Password
  - Two-Factor Authentication
  - Session Timeout
  - IP Whitelist

**Backend APIs ที่ต้องเพิ่ม:**
```
GET    /api/admin/settings
PUT    /api/admin/settings
GET    /api/admin/settings/points
PUT    /api/admin/settings/points
GET    /api/admin/settings/payment
PUT    /api/admin/settings/payment
GET    /api/admin/settings/email
PUT    /api/admin/settings/email
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
```

**Timeline:** 3-4 วัน

---

## 🔧 Backend APIs ที่ต้องเพิ่ม

### 📊 Reports APIs (Priority 1)

```javascript
// server/routes/admin.js

// Sales Report
router.get('/reports/sales', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Members Report
router.get('/reports/members', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Points Report
router.get('/reports/points', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redemptions Report
router.get('/reports/redemptions', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export Report
router.get('/reports/export/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params; // 'sales', 'members', 'points', 'redemptions'
    const { format = 'csv' } = req.query; // 'csv', 'excel', 'pdf'
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 📈 Dashboard APIs (Priority 1)

```javascript
// Revenue Chart Data
router.get('/dashboard/charts/revenue', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Members Growth Chart
router.get('/dashboard/charts/members', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recent Activities
router.get('/dashboard/activities/recent', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alerts
router.get('/dashboard/alerts', authenticateToken, async (req, res) => {
  try {
    // Low stock rewards, inactive customers, etc.
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 🎁 Rewards APIs (Priority 1)

```javascript
// Toggle Status
router.put('/rewards/:id/toggle-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk Delete
router.post('/rewards/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload Image
router.post('/rewards/upload-image', authenticateToken, async (req, res) => {
  try {
    // Use multer for file upload
    // Save to Supabase Storage or Cloudinary
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Reward Redemptions
router.get('/rewards/:id/redemptions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    // Get all categories
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/categories', authenticateToken, async (req, res) => {
  try {
    const { name, icon } = req.body;
    // Create category
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 👤 Customer Detail APIs (Priority 2)

```javascript
// Get Customer Transactions
router.get('/customers/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Customer Points History
router.get('/customers/:id/points-history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Customer Redemptions
router.get('/customers/:id/redemptions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password
router.post('/customers/:id/reset-password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Generate temporary password and send email
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### ⭐ Points Management APIs (Priority 2)

```javascript
// Deduct Points
router.post('/points/deduct', authenticateToken, async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk Add Points
router.post('/points/bulk-add', authenticateToken, async (req, res) => {
  try {
    const { users, points, description } = req.body;
    // users: [{ userId, points }]
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Expiring Points
router.get('/points/expiring', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    // Get points expiring in X days
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 👥 Customers Enhanced APIs (Priority 2)

```javascript
// Bulk Delete
router.post('/customers/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk Update Tier
router.post('/customers/bulk-update-tier', authenticateToken, async (req, res) => {
  try {
    const { ids, tier } = req.body;
    // Implementation...
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk Email
router.post('/customers/bulk-email', authenticateToken, async (req, res) => {
  try {
    const { ids, subject, message } = req.body;
    // Send email to multiple customers
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export Customers
router.get('/customers/export', authenticateToken, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    // Export as CSV or Excel
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import Customers
router.post('/customers/import', authenticateToken, async (req, res) => {
  try {
    // Parse CSV and create customers
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### ⚙️ Settings APIs (Priority 3)

```javascript
// Get Settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    // Get all settings
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const settings = req.body;
    // Update settings
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Users CRUD
router.get('/users', authenticateToken, async (req, res) => {
  // Get all admin users
});

router.post('/users', authenticateToken, async (req, res) => {
  // Create admin user
});

router.put('/users/:id', authenticateToken, async (req, res) => {
  // Update admin user
});

router.delete('/users/:id', authenticateToken, async (req, res) => {
  // Delete admin user
});
```

---

## 📅 Timeline Summary

### Sprint 1 (สัปดาห์ 1): Priority 1 - Critical
**เป้าหมาย:** ทำให้ฟีเจอร์หลักใช้งานได้เต็มที่

- **วันที่ 1-2:** Dashboard - Complete Analytics (2 วัน)
- **วันที่ 3-4:** Rewards Management - Complete CRUD (2 วัน)
- **วันที่ 5-7:** Reports Page - Full Implementation (3 วัน)

**ผลลัพธ์:** Admin Panel ใช้งานได้ 80%

---

### Sprint 2 (สัปดาห์ 2): Priority 2 - Important
**เป้าหมาย:** เพิ่มความสมบูรณ์และฟีเจอร์เสริม

- **วันที่ 1-2:** Points Management - Enhanced (2 วัน)
- **วันที่ 3-4:** Customers Page - Enhanced (2 วัน)
- **วันที่ 5-7:** Customer Detail Page - Complete (3 วัน)

**ผลลัพธ์:** Admin Panel ใช้งานได้ 95%

---

### Sprint 3 (สัปดาห์ 3): Priority 3 - Nice to Have
**เป้าหมาย:** เสร็จสิ้นและปรับปรุง

- **วันที่ 1-4:** Settings Page - Full Implementation (4 วัน)
- **วันที่ 5-7:** Testing, Bug Fixes, Polish (3 วัน)

**ผลลัพธ์:** Admin Panel ใช้งานได้ 100%

---

## 📦 Dependencies ที่ต้องติดตั้งเพิ่ม

### Frontend (Admin Panel)

```bash
# Charts
npm install recharts

# Date Picker
npm install react-datepicker
npm install @types/react-datepicker

# File Upload
npm install react-dropzone

# Excel Export
npm install xlsx

# PDF Generation
npm install jspdf jspdf-autotable

# Rich Text Editor (for email templates)
npm install react-quill

# Toast Notifications
npm install react-hot-toast
```

### Backend (Server)

```bash
# File Upload
npm install multer

# Excel Generation
npm install exceljs

# PDF Generation
npm install pdfkit

# CSV Parser
npm install csv-parser fast-csv

# Email
npm install nodemailer

# Image Processing
npm install sharp

# Cron Jobs (for points expiry)
npm install node-cron
```

---

## 🎨 UI Components ที่ต้องสร้าง

### Shared Components

```typescript
// LoadingSpinner.tsx
export const LoadingSpinner = ({ size, color }) => { ... }

// EmptyState.tsx
export const EmptyState = ({ icon, title, description, action }) => { ... }

// ConfirmModal.tsx
export const ConfirmModal = ({ title, message, onConfirm, onCancel }) => { ... }

// Toast.tsx (using react-hot-toast)
export const showToast = { success, error, info, warning }

// DateRangePicker.tsx
export const DateRangePicker = ({ startDate, endDate, onChange }) => { ... }

// SearchInput.tsx
export const SearchInput = ({ value, onChange, placeholder }) => { ... }

// FilterDropdown.tsx
export const FilterDropdown = ({ options, value, onChange }) => { ... }

// ExportButton.tsx
export const ExportButton = ({ formats, onExport }) => { ... }

// Pagination.tsx
export const Pagination = ({ current, total, onChange }) => { ... }

// StatsCard.tsx
export const StatsCard = ({ label, value, icon, color, change }) => { ... }

// Chart.tsx (wrapper for recharts)
export const LineChart = ({ data, xKey, yKey }) => { ... }
export const BarChart = ({ data, xKey, yKey }) => { ... }
export const PieChart = ({ data }) => { ... }
export const AreaChart = ({ data, xKey, yKey }) => { ... }

// Table.tsx
export const DataTable = ({ columns, data, loading, onSort, onFilter }) => { ... }

// Badge.tsx
export const Badge = ({ label, color, icon }) => { ... }

// ActionButton.tsx
export const ActionButton = ({ icon, label, onClick, variant }) => { ... }
```

---

## 🧪 Testing Plan

### Unit Tests
- API Client functions
- Utility functions
- Data formatters

### Integration Tests
- API endpoints
- Database queries
- File uploads

### E2E Tests (Playwright/Cypress)
- Login flow
- Create/Edit/Delete operations
- Report generation
- Export functions

---

## 🚀 Deployment Checklist

### Before Deployment

- ✅ All APIs tested
- ✅ All pages functional
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Loading states added
- ✅ Error handling complete
- ✅ Environment variables set
- ✅ Build successful

### After Deployment

- ✅ Test all features in production
- ✅ Check performance
- ✅ Monitor error logs
- ✅ Collect user feedback
- ✅ Fix critical bugs

---

## 📝 Documentation to Create

1. **Admin User Guide**
   - How to use each feature
   - Screenshots
   - Best practices

2. **API Documentation**
   - All endpoints
   - Request/Response examples
   - Error codes

3. **Development Guide**
   - Setup instructions
   - Code structure
   - Contributing guidelines

---

## 💡 Additional Features (Future)

### Phase 4: Advanced Features

1. **Advanced Analytics**
   - Customer Segmentation
   - Cohort Analysis
   - Predictive Analytics
   - A/B Testing

2. **Marketing Tools**
   - Email Campaigns
   - Push Notifications
   - SMS Marketing
   - Promotion Builder

3. **Automation**
   - Auto-reward on milestones
   - Birthday rewards
   - Inactive user re-engagement
   - Points expiry reminders

4. **Multi-location**
   - Store management
   - Branch-specific reports
   - Transfer stock between branches

5. **Advanced Permissions**
   - Role-based access control
   - Custom permissions
   - Audit logs
   - Activity tracking

---

## 🎯 Success Metrics

### After Sprint 1
- [ ] 3 critical pages functional
- [ ] Reports can be generated
- [ ] Dashboard shows real data

### After Sprint 2
- [ ] All customer management features work
- [ ] Points management complete
- [ ] Bulk operations functional

### After Sprint 3
- [ ] 100% of pages functional
- [ ] Settings configurable
- [ ] Admin panel production-ready

---

## 📞 Support & Maintenance

### Daily
- Monitor error logs
- Check system health
- Review user feedback

### Weekly
- Update dependencies
- Review performance
- Plan improvements

### Monthly
- Security audit
- Feature planning
- User training

---

## ✅ Checklist สำหรับแต่ละหน้า

### Dashboard ✓
- [ ] Fix revenue chart API
- [ ] Add members growth chart
- [ ] Implement recent activities
- [ ] Add alerts section
- [ ] Real-time stats updates

### Reports ✗
- [ ] Create Sales Report
- [ ] Create Members Report
- [ ] Create Points Report
- [ ] Create Redemptions Report
- [ ] Add date range filter
- [ ] Add export functions (PDF, Excel, CSV)
- [ ] Add charts/graphs

### Rewards ✓
- [ ] Fix image upload
- [ ] Add toggle status
- [ ] Add bulk delete
- [ ] Add stock alert
- [ ] Add redemption history
- [ ] Category management

### Customers ✓
- [ ] Add advanced filters
- [ ] Add bulk actions
- [ ] Implement export
- [ ] Implement import
- [ ] Real pagination

### Customer Detail ✓
- [ ] Add transaction history
- [ ] Add points history chart
- [ ] Add redemption history
- [ ] Add edit customer
- [ ] Add reset password

### Points ✓
- [ ] Add deduct points
- [ ] Add bulk points
- [ ] Add expiry management
- [ ] Add export function

### Settings ✗
- [ ] Create General Settings
- [ ] Create Points Settings
- [ ] Create Payment Settings
- [ ] Create Email Settings
- [ ] Admin Users Management
- [ ] Security Settings

---

**สรุป:**
- **Timeline รวม:** 3 สัปดาห์ (15-21 วันทำการ)
- **Effort:** Full-time development
- **Result:** Admin Panel ใช้งานได้เต็มรูปแบบ 100%

---

**หมายเหตุ:** แผนนี้สามารถปรับเปลี่ยนได้ตามความต้องการและลำดับความสำคัญที่แท้จริง ควรเริ่มจาก Priority 1 ก่อนเพื่อให้ระบบใช้งานได้เร็วที่สุด

---

**อัพเดทล่าสุด:** 5 กุมภาพันธ์ 2026  
**ผู้จัดทำ:** System Architect AI  
**สถานะ:** Ready for Implementation
