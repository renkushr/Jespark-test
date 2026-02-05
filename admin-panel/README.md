# 🎛️ Jespark Admin Panel

Admin Panel สำหรับจัดการระบบ Jespark Rewards

## 🚀 Quick Start

### ติดตั้ง Dependencies

```bash
npm install
```

### รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่: `http://localhost:3001`

### Build สำหรับ Production

```bash
npm run build
```

## 📱 Features

### ✅ เสร็จแล้ว
- 🔐 Login Page
- 📊 Dashboard (สถิติและกราฟ)
- 👥 Customers Management (รายชื่อและรายละเอียด)
- 🎨 Responsive Layout
- 🧭 Navigation (Sidebar & Header)

### 🔄 กำลังพัฒนา
- 💰 Points & Transactions
- 🎁 Rewards Management
- 📊 Reports & Analytics
- ⚙️ Settings

## 🎨 Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Material Symbols** - Icons

## 📁 โครงสร้างโปรเจค

```
admin-panel/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.tsx
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Customers.tsx
│   │   ├── CustomerDetail.tsx
│   │   ├── Points.tsx
│   │   ├── Rewards.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🔐 Login

**Demo Mode**: ใช้อีเมลและรหัสผ่านใดก็ได้เพื่อเข้าสู่ระบบ

## 📝 TODO

- [ ] เชื่อม API จริง
- [ ] เพิ่มหน้า Points Management
- [ ] เพิ่มหน้า Rewards Management
- [ ] เพิ่มหน้า Reports
- [ ] เพิ่ม Charts (Recharts)
- [ ] เพิ่ม Export ข้อมูล
- [ ] เพิ่ม Settings
- [ ] เพิ่ม Admin User Management
- [ ] เพิ่ม Notifications
- [ ] เพิ่ม Activity Log

## 🌐 Deployment

### Vercel
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

## 📄 License

© 2026 Jespark. All rights reserved.
