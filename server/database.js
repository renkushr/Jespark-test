import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_FILE = join(__dirname, 'database.json');

// Initialize database
let db = {
  users: [],
  rewards: [],
  transactions: [],
  redemptions: [],
  notifications: [],
  coupons: [],
  stores: [],
  _nextId: {
    users: 1,
    rewards: 1,
    transactions: 1,
    redemptions: 1,
    notifications: 1,
    coupons: 1,
    stores: 1
  }
};

// Load database from file
const loadDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
};

// Save database to file
const saveDB = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
};

loadDB();

// Helper functions
const getNextId = (table) => {
  const id = db._nextId[table];
  db._nextId[table]++;
  saveDB();
  return id;
};

// Initialize sample data
const initSampleData = () => {
  if (db.rewards.length === 0) {
    db.rewards = [
      { id: getNextId('rewards'), title: 'ชุดคอมโบมื้อเช้า', description: 'ใช้ได้ถึง 24 ต.ค. นี้', points: 850, category: 'อาหาร', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV9q2NoqqZX0evj0zH1KwEk7vbHLRBfpXygNxZNYqpPJFAVanCqQY7-SbaBvjNLJKg3_C5FZAD48YgnfQzJXHkr8bIlwcWecIq2lfyNDuvk_awWPSuP12nn95qjQVvRTWUY6UlcJAPAg8fTGgszNZb2wCAQp1txivHmsSx-QXpaVkNLT4O_FBa8DkySa6CnkiO85jKVx60cifkJON0XRsT4mRHhJYMR5RPvhs68e5bTb1bTJ0xW5CyCc7J54F8-ewlbNqhcwktbA6i', is_popular: true, is_limited: false, stock: 50 },
      { id: getNextId('rewards'), title: 'เซตสกินแคร์หน้าใส', description: 'รางวัลพิเศษจำนวนจำกัด', points: 3200, category: 'ไลฟ์สไตล์', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCz65zieJQ-LhzUPxDKQG0X1zH1PxrGMiitqicShaoS8Twu27cSWlNTcBav9tz_sDnfR7dr7XwnLouZgTES1-5BaR0RnLgW5f9MbbmH0EUunt5-Joj9-OG3h5z5pglomgW1JjXScc5ZVskbbTM9oqghqpFaavWXBcZEk8deF_gUGPb_QpRkCmBJmKU5rPgmzRSZ2ooakYMYWbhI-iX5DcQ0mCtvZ15D6Wdttmyk2F5wI_vZS_rLbP7FuLcLYIZFiuA-GUS7go8ZI-G', is_popular: true, is_limited: true, stock: 20 },
      { id: getNextId('rewards'), title: 'กาแฟฟรี 10 แก้ว', description: 'ใช้ได้ที่ร้านในเครือทุกสาขา', points: 1500, category: 'เครื่องดื่ม', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800', is_popular: true, is_limited: false, stock: -1 },
      { id: getNextId('rewards'), title: 'บัตรกำนัล 500 บาท', description: 'ใช้ซื้อสินค้าทุกประเภท', points: 2000, category: 'บัตรกำนัล', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=800', is_popular: false, is_limited: false, stock: -1 },
      { id: getNextId('rewards'), title: 'หูฟังบลูทูธ Premium', description: 'คุณภาพเสียงระดับ Hi-Fi', points: 5000, category: 'อิเล็กทรอนิกส์', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', is_popular: true, is_limited: true, stock: 15 },
      { id: getNextId('rewards'), title: 'เสื้อยืดแบรนด์เนม', description: 'Limited Edition Collection', points: 2500, category: 'แฟชั่น', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800', is_popular: false, is_limited: true, stock: 30 },
      { id: getNextId('rewards'), title: 'บัตรชมภาพยนตร์ 2 ที่นั่ง', description: 'ใช้ได้ทุกโรงในเครือ', points: 1200, category: 'บันเทิง', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800', is_popular: true, is_limited: false, stock: -1 },
      { id: getNextId('rewards'), title: 'ชุดอาหารญี่ปุ่น', description: 'เซตสุดคุ้มสำหรับ 2 ท่าน', points: 1800, category: 'อาหาร', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=800', is_popular: false, is_limited: false, stock: -1 }
    ];
  }

  if (db.stores.length === 0) {
    db.stores = [
      { id: getNextId('stores'), name: 'Jespark Central World', address: '999/9 ถนนพระราม 1 ปทุมวัน กรุงเทพฯ', phone: '02-123-4567', latitude: 13.7467, longitude: 100.5398, opening_hours: '10:00-22:00', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800' },
      { id: getNextId('stores'), name: 'Jespark Siam Paragon', address: '991 ถนนพระราม 1 ปทุมวัน กรุงเทพฯ', phone: '02-234-5678', latitude: 13.7465, longitude: 100.5347, opening_hours: '10:00-22:00', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800' },
      { id: getNextId('stores'), name: 'Jespark EmQuartier', address: '693 ถนนสุขุมวิท คลองตันเหนือ กรุงเทพฯ', phone: '02-345-6789', latitude: 13.7308, longitude: 100.5698, opening_hours: '10:00-22:00', image: 'https://images.unsplash.com/photo-1567958451986-2de427a4a0be?auto=format&fit=crop&q=80&w=800' },
      { id: getNextId('stores'), name: 'Jespark IconSiam', address: '299 ถนนเจริญนคร คลองต้นไทร กรุงเทพฯ', phone: '02-456-7890', latitude: 13.7268, longitude: 100.5101, opening_hours: '10:00-22:00', image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&q=80&w=800' },
      { id: getNextId('stores'), name: 'Jespark MBK Center', address: '444 ถนนพญาไท ปทุมวัน กรุงเทพฯ', phone: '02-567-8901', latitude: 13.7446, longitude: 100.5300, opening_hours: '10:00-21:00', image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&q=80&w=800' }
    ];
  }

  if (db.coupons.length === 0) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    db.coupons = [
      { id: getNextId('coupons'), code: 'WELCOME50', title: 'ส่วนลดสมาชิกใหม่', description: 'รับส่วนลด 50 บาท สำหรับการซื้อครั้งแรก', discount_type: 'fixed', discount_value: 50, min_purchase: 200, expiry_date: expiryDate.toISOString(), is_used: false, user_id: null, category: 'Welcome' },
      { id: getNextId('coupons'), code: 'COFFEE20', title: 'ส่วนลดเครื่องดื่ม', description: 'ลด 20% สำหรับเครื่องดื่มทุกประเภท', discount_type: 'percentage', discount_value: 20, min_purchase: 100, expiry_date: expiryDate.toISOString(), is_used: false, user_id: null, category: 'Beverage' },
      { id: getNextId('coupons'), code: 'FOOD100', title: 'ส่วนลดอาหาร', description: 'ลด 100 บาท เมื่อซื้ออาหารครบ 500 บาท', discount_type: 'fixed', discount_value: 100, min_purchase: 500, expiry_date: expiryDate.toISOString(), is_used: false, user_id: null, category: 'Food' },
      { id: getNextId('coupons'), code: 'FLASH30', title: 'Flash Sale 30%', description: 'ส่วนลดพิเศษ 30% ทุกสินค้า', discount_type: 'percentage', discount_value: 30, min_purchase: 300, expiry_date: expiryDate.toISOString(), is_used: false, user_id: null, category: 'Flash Sale' }
    ];
  }

  saveDB();
  console.log('✅ Sample data initialized');
};

initSampleData();

// Export database and helper functions
export default {
  get: () => db,
  save: saveDB,
  getNextId,
  users: {
    find: (predicate) => db.users.find(predicate),
    findAll: (predicate) => predicate ? db.users.filter(predicate) : db.users,
    create: (user) => {
      const newUser = { ...user, id: getNextId('users'), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      db.users.push(newUser);
      saveDB();
      return newUser;
    },
    update: (id, updates) => {
      const index = db.users.findIndex(u => u.id === id);
      if (index !== -1) {
        db.users[index] = { ...db.users[index], ...updates, updated_at: new Date().toISOString() };
        saveDB();
        return db.users[index];
      }
      return null;
    }
  },
  rewards: {
    findAll: (predicate) => predicate ? db.rewards.filter(predicate) : db.rewards,
    find: (predicate) => db.rewards.find(predicate)
  },
  transactions: {
    findAll: (predicate) => predicate ? db.transactions.filter(predicate) : db.transactions,
    create: (transaction) => {
      const newTransaction = { ...transaction, id: getNextId('transactions'), created_at: new Date().toISOString() };
      db.transactions.push(newTransaction);
      saveDB();
      return newTransaction;
    }
  },
  redemptions: {
    findAll: (predicate) => predicate ? db.redemptions.filter(predicate) : db.redemptions,
    create: (redemption) => {
      const newRedemption = { ...redemption, id: getNextId('redemptions'), created_at: new Date().toISOString() };
      db.redemptions.push(newRedemption);
      saveDB();
      return newRedemption;
    }
  },
  notifications: {
    findAll: (predicate) => predicate ? db.notifications.filter(predicate) : db.notifications,
    create: (notification) => {
      const newNotification = { ...notification, id: getNextId('notifications'), created_at: new Date().toISOString() };
      db.notifications.push(newNotification);
      saveDB();
      return newNotification;
    },
    update: (id, updates) => {
      const index = db.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        db.notifications[index] = { ...db.notifications[index], ...updates };
        saveDB();
        return db.notifications[index];
      }
      return null;
    },
    updateAll: (predicate, updates) => {
      db.notifications = db.notifications.map(n => predicate(n) ? { ...n, ...updates } : n);
      saveDB();
    }
  },
  coupons: {
    findAll: (predicate) => predicate ? db.coupons.filter(predicate) : db.coupons,
    find: (predicate) => db.coupons.find(predicate),
    create: (coupon) => {
      const newCoupon = { ...coupon, id: getNextId('coupons'), created_at: new Date().toISOString() };
      db.coupons.push(newCoupon);
      saveDB();
      return newCoupon;
    },
    update: (id, updates) => {
      const index = db.coupons.findIndex(c => c.id === id);
      if (index !== -1) {
        db.coupons[index] = { ...db.coupons[index], ...updates };
        saveDB();
        return db.coupons[index];
      }
      return null;
    }
  },
  stores: {
    findAll: () => db.stores,
    find: (predicate) => db.stores.find(predicate)
  }
};
