import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getNavigationTheme, getThemeColors, type ThemeName } from '../theme';

type ThemeContextValue = {
  theme: ThemeName;
  isDark: boolean;
  colors: ReturnType<typeof getThemeColors>;
  navigationTheme: ReturnType<typeof getNavigationTheme>;
  ready: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeName) => Promise<void>;
};

const STORAGE_KEY = 'billify-theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ThemeName {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(getSystemTheme());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active) {
          return;
        }

        const nextTheme = storedTheme === 'dark' || storedTheme === 'light'
          ? storedTheme
          : getSystemTheme();
        setThemeState(nextTheme);
      } finally {
        if (active) {
          setReady(true);
        }
      }
    };

    loadTheme();

    return () => {
      active = false;
    };
  }, []);

  const setTheme = async (nextTheme: ThemeName) => {
    setThemeState(nextTheme);
    await AsyncStorage.setItem(STORAGE_KEY, nextTheme);
  };

  const toggleTheme = () => {
    void setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const value = useMemo(() => {
    const colors = getThemeColors(theme);

    return {
      theme,
      isDark: theme === 'dark',
      colors,
      navigationTheme: getNavigationTheme(theme),
      ready,
      toggleTheme,
      setTheme,
    };
  }, [ready, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }

  return context;
}
