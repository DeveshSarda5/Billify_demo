import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';
import { gradients, radius } from '../../theme';

type AppButtonProps = {
  title?: string;
  children?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export default function AppButton({
  title,
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: AppButtonProps) {
  const { colors, isDark } = useAppTheme();
  const label = typeof children === 'string' ? children : title;
  const isDisabled = disabled || loading;

  return (
    <Pressable disabled={isDisabled} onPress={onPress} style={({ pressed }) => [styles.button, pressed && !isDisabled && styles.pressed, isDisabled && styles.disabled]}>
      {variant === 'primary' ? (
        <LinearGradient
          colors={isDark ? gradients.primaryDark : gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryText}>{label}</Text>}
        </LinearGradient>
      ) : (
        <View style={[styles.secondary, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          {loading ? <ActivityIndicator color={colors.text} /> : <Text style={[styles.secondaryText, { color: colors.text }]}>{label}</Text>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.55,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
