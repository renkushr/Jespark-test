-- Jespark Rewards & Lifestyle Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  line_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  tier VARCHAR(50) DEFAULT 'Member',
  points INTEGER DEFAULT 0,
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  member_since VARCHAR(4) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rewards Table
CREATE TABLE rewards (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'topup', 'payment', 'refund'
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Redemptions Table
CREATE TABLE redemptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  reward_id BIGINT REFERENCES rewards(id) ON DELETE SET NULL,
  points_used INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  redemption_code VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons Table
CREATE TABLE coupons (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(50), -- 'percentage', 'fixed'
  discount_value DECIMAL(10, 2),
  min_purchase DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores Table
CREATE TABLE stores (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  opening_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points History Table
CREATE TABLE points_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'earned', 'spent', 'expired', 'adjusted'
  description TEXT,
  reference_id BIGINT, -- ID of related transaction/redemption
  reference_type VARCHAR(50), -- 'transaction', 'redemption', 'cashier'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cashier Transactions Table
CREATE TABLE cashier_transactions (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  cashier_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  points_earned INTEGER NOT NULL,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX idx_users_line_id ON users(line_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_redemptions_user_id ON redemptions(user_id);
CREATE INDEX idx_redemptions_status ON redemptions(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_coupons_user_id ON coupons(user_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_points_history_user_id ON points_history(user_id);
CREATE INDEX idx_cashier_transactions_customer_id ON cashier_transactions(customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_redemptions_updated_at BEFORE UPDATE ON redemptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own redemptions
CREATE POLICY "Users can view own redemptions" ON redemptions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can view their own coupons
CREATE POLICY "Users can view own coupons" ON coupons
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own points history
CREATE POLICY "Users can view own points history" ON points_history
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Public read access for rewards and stores
CREATE POLICY "Anyone can view active rewards" ON rewards
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active stores" ON stores
  FOR SELECT USING (is_active = true);

-- Insert sample data
INSERT INTO rewards (name, description, points_required, category, stock, is_active) VALUES
  ('Starbucks Coffee', 'Free Tall Size Coffee', 500, 'Food & Beverage', 100, true),
  ('Cinema Ticket', 'Free Movie Ticket', 800, 'Entertainment', 50, true),
  ('Discount Voucher 100฿', '100 Baht Discount', 300, 'Shopping', 200, true),
  ('Discount Voucher 500฿', '500 Baht Discount', 1500, 'Shopping', 100, true),
  ('Spa Treatment', '1 Hour Massage', 2000, 'Wellness', 30, true);

INSERT INTO stores (name, address, phone, latitude, longitude, is_active) VALUES
  ('Jespark Central World', '999/9 Rama I Rd, Pathum Wan, Bangkok', '02-123-4567', 13.7467, 100.5398, true),
  ('Jespark Siam Paragon', '991 Rama I Rd, Pathum Wan, Bangkok', '02-234-5678', 13.7465, 100.5347, true),
  ('Jespark EmQuartier', '693 Sukhumvit Rd, Khlong Tan Nuea, Bangkok', '02-345-6789', 13.7308, 100.5698, true);
