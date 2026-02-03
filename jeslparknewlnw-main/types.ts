
export interface User {
  name: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Member';
  memberSince: string;
  points: number;
  walletBalance: number;
  avatar: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  image: string;
  category: string;
  isPopular?: boolean;
  isLimited?: boolean;
}

export interface Deal {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  expiry?: string;
}

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: 'Payment' | 'Top-up' | 'Rewards' | 'Redemption';
  date: string;
  time: string;
  status: 'Completed' | 'Successful' | 'Earned' | 'Pending';
  icon: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  category: 'Promotions' | 'General' | 'System';
  isUnread: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}
