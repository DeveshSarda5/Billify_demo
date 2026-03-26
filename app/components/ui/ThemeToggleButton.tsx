import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { radius } from '../../theme';

export default function ThemeToggleButton() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const translateX = useRef(new Animated.Value(isDark ? 22 : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isDark ? 22 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isDark, translateX]);

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
      <View style={[styles.switchTrack, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}> 
        <Animated.View
          style={[
            styles.iconWrap,
            { backgroundColor: isDark ? colors.primary : '#ffffff', transform: [{ translateX }] },
          ]}
        >
          {isDark ? <Moon size={16} color="#ffffff" /> : <Sun size={16} color={colors.primary} />}
        </Animated.View>
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
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
