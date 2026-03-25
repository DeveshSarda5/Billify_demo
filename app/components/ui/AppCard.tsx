import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { radius, shadows } from '../../theme';

type AppCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export default function AppCard({ children, style }: AppCardProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        shadows[isDark ? 'dark' : 'light'],
        style,
      ]}
    >
      {children}
    </View>
  );
}
