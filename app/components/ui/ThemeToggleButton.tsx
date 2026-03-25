import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { radius } from '../../theme';

export default function ThemeToggleButton() {
  const { colors, isDark, toggleTheme } = useAppTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: isDark ? colors.primary : colors.cardAlt }]}> 
        {isDark ? <Moon size={16} color="#ffffff" /> : <Sun size={16} color={colors.primary} />}
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{isDark ? 'Dark' : 'Light'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
