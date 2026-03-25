import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native';

export type ThemeName = 'light' | 'dark';

const baseColors = {
  light: {
    background: '#f8fafc',
    card: '#ffffff',
    cardAlt: '#f8fafc',
    text: '#111827',
    textMuted: '#64748b',
    textSoft: '#94a3b8',
    border: '#e2e8f0',
    primary: '#16a34a',
    primaryAlt: '#22c55e',
    success: '#22c55e',
    warningBg: '#fef3c7',
    warningText: '#92400e',
    danger: '#ef4444',
    overlay: 'rgba(15, 23, 42, 0.42)',
    inputBackground: '#ffffff',
    inputPlaceholder: '#94a3b8',
    chip: '#ecfdf5',
    chipText: '#15803d',
    divider: '#e5e7eb',
    icon: '#475569',
    statusBar: 'dark' as const,
  },
  dark: {
    background: '#020617',
    card: '#0f172a',
    cardAlt: '#111c32',
    text: '#f1f5f9',
    textMuted: '#cbd5e1',
    textSoft: '#94a3b8',
    border: '#1e293b',
    primary: '#22c55e',
    primaryAlt: '#4ade80',
    success: '#4ade80',
    warningBg: '#3f2d12',
    warningText: '#fbbf24',
    danger: '#f87171',
    overlay: 'rgba(2, 6, 23, 0.72)',
    inputBackground: '#0b1220',
    inputPlaceholder: '#64748b',
    chip: '#052e16',
    chipText: '#86efac',
    divider: '#1e293b',
    icon: '#cbd5e1',
    statusBar: 'light' as const,
  },
};

export const spacing = {
  screenX: 16,
  screenY: 10,
  card: 16,
  section: 12,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export const shadows = {
  light: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  dark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  },
};

export function getThemeColors(theme: ThemeName) {
  return baseColors[theme];
}

export function getNavigationTheme(theme: ThemeName): NavigationTheme {
  const colors = getThemeColors(theme);
  const baseTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
      notification: colors.danger,
    },
  };
}

export const gradients = {
  primary: ['#16a34a', '#34d399'],
  primaryDark: ['#166534', '#16a34a'],
  success: ['#16a34a', '#22c55e'],
};
