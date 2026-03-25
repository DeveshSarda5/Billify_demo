import { ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';

type ScreenProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  safeEdges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
};

export default function Screen({
  children,
  scrollable = false,
  padded = true,
  safeEdges = ['top', 'left', 'right'],
  style,
  contentStyle,
  scrollProps,
}: ScreenProps) {
  const { colors } = useAppTheme();
  const baseContentStyle = padded
    ? {
        paddingHorizontal: spacing.screenX,
        paddingTop: spacing.screenY,
        paddingBottom: 100,
      }
    : { paddingBottom: 100 };

  return (
    <SafeAreaView edges={safeEdges} style={[styles.safeArea, { backgroundColor: colors.background }, style]}>
      {scrollable ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollProps}
          contentContainerStyle={[baseContentStyle, contentStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, padded && styles.padded, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.screenY,
  },
});
