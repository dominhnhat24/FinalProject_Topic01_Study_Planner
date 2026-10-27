// frontend/src/constants/theme.ts
export const COLORS = {
  primary: '#6C5CE7',      // Tím Indigo chủ đạo (sang trọng, hiện đại)
  primaryLight: '#A29BFE', // Tím nhạt cho badge, hiệu ứng
  secondary: '#00CEC9',    // Xanh ngọc điểm nhấn
  accent: '#FF7675',       // Cam hồng cho Cảnh báo / Quá hạn
  success: '#00B894',      // Xanh mint cho Hoàn thành
  warning: '#FDCB6E',      // Vàng pastel cho Đang xử lý
  
  // Backgrounds
  background: '#F8F9FA',
  card: '#FFFFFF',
  darkBackground: '#0F172A',
  darkCard: '#1E293B',

  // Text
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textMuted: '#B2BEC3',
  white: '#FFFFFF',
  
  border: '#EDF2F7',
};

export const SHADOWS = {
  soft: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
};