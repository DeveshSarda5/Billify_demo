import type { TextInputProps } from 'react-native';
import { TextInput } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

export default function AppInput(props: TextInputProps) {
  const { colors } = useAppTheme();

  return (
    <TextInput
      placeholderTextColor={colors.inputPlaceholder}
      selectionColor={colors.primary}
      {...props}
      style={[
        {
          backgroundColor: colors.inputBackground,
          color: colors.text,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
          fontSize: 15,
        },
        props.style,
      ]}
    />
  );
}
