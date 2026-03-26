import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native';

export type ThemeName = 'light' | 'dark';

const baseColors = {
  light: {
    background: '#f4f7f5',
    card: '#ffffff',
    cardAlt: '#ecf7ef',
    text: '#1f2937',
    textMuted: '#6b7280',
    textSoft: '#94a3b8',
    border: '#dbe5dd',
    primary: '#4caf50',
    primaryAlt: '#10b981',
    success: '#10b981',
    warningBg: '#fef3c7',
    warningText: '#92400e',
    danger: '#ef4444',
    overlay: 'rgba(15, 23, 42, 0.24)',
    inputBackground: '#ffffff',
    inputPlaceholder: '#9ca3af',
    chip: '#ecfdf5',
    chipText: '#047857',
    divider: '#d1d5db',
    icon: '#4b5563',
    statusBar: 'dark' as const,
  },
  dark: {
    background: '#0f1720',
    card: '#18212b',
    cardAlt: '#20303a',
    text: '#f3f4f6',
    textMuted: '#c7d2da',
    textSoft: '#94a3b8',
    border: '#30414d',
    primary: '#66bb6a',
    primaryAlt: '#34d399',
    success: '#34d399',
    warningBg: '#49361f',
    warningText: '#facc15',
    danger: '#f87171',
    overlay: 'rgba(2, 6, 23, 0.6)',
    inputBackground: '#111a24',
    inputPlaceholder: '#7b8794',
    chip: '#183927',
    chipText: '#9ee6b3',
    divider: '#334155',
    icon: '#d1d5db',
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
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
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
  primary: ['#4caf50', '#10b981'] as const,
  primaryDark: ['#2e7d32', '#4caf50'] as const,
  success: ['#4caf50', '#34d399'] as const,
};
