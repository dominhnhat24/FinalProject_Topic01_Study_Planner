export const LIGHT_COLORS = {
  primary: "#0084FF",
  secondary: "#44A8FF",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  bg: "#F7FAFD",
  surface: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  line: "#D9EAF7",
  neutral100: "#EEF7FF",
  neutral300: "#C9E3F7",
  neutral700: "#35516A",
  neutral900: "#0F172A",
  softBlue: "#E7F3FF",
  white: "#FFFFFF",
} as const;

export const DARK_COLORS = {
  primary: "#4DA3FF",
  secondary: "#79B9FF",
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  bg: "#09131F",
  surface: "#102033",
  text: "#F8FAFC",
  muted: "#9DB2C5",
  line: "#27425C",
  neutral100: "#12283E",
  neutral300: "#3E5C77",
  neutral700: "#C7D9EA",
  neutral900: "#F8FAFC",
  softBlue: "#143554",
  white: "#FFFFFF",
} as const;

export type AppColors = typeof LIGHT_COLORS;

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;
