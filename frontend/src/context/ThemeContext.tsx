// frontend/src/context/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';

const lightColors = {
  bg: '#F8F9FA',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  primary: '#6C5CE7',
  secondary: '#00CEC9',
  success: '#00B894',
  text: '#2D3436',
  muted: '#636E72',
  border: '#EDF2F7',
  line: '#EDF2F7',
  error: '#D63031',
};

const darkColors = {
  bg: '#121212',
  card: '#1E1E1E',
  surface: '#1E1E1E',
  primary: '#6C5CE7',
  secondary: '#00CEC9',
  success: '#00B894',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  border: '#2C2C2C',
  line: '#2C2C2C',
  error: '#FF7675',
};

interface ThemeContextType {
  isDark: boolean;
  colors: typeof lightColors;
  toggleTheme: () => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  toggle: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, toggle: toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);