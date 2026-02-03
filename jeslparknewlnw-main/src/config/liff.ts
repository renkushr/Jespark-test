// LINE LIFF Configuration
export const LIFF_CONFIG = {
  liffId: import.meta.env.VITE_LIFF_ID || '',
  channelId: import.meta.env.VITE_LINE_CHANNEL_ID || '',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
};

// Check if LIFF is configured
export const isLiffConfigured = (): boolean => {
  return Boolean(LIFF_CONFIG.liffId && LIFF_CONFIG.channelId);
};

// Get LIFF URL
export const getLiffUrl = (): string => {
  if (!LIFF_CONFIG.liffId) {
    console.warn('LIFF ID is not configured');
    return '';
  }
  return `https://liff.line.me/${LIFF_CONFIG.liffId}`;
};
