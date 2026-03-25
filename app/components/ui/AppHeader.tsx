import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';
import ThemeToggleButton from './ThemeToggleButton';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  showThemeToggle?: boolean;
};

export default function AppHeader({
  title,
  subtitle,
  onBack,
  rightSlot,
  showThemeToggle = true,
}: AppHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.titleRow}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
          ) : null}
          <View style={styles.copy}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
          </View>
        </View>
        {rightSlot || (showThemeToggle ? <ThemeToggleButton /> : <View style={styles.placeholder} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  placeholder: {
    width: 44,
  },
});