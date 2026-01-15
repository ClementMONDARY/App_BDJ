import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import {
  borderRadius,
  fonts,
  type fontSize,
  shadows,
  type ThemeColors,
} from "@/styles";
import { forwardRef } from "react";
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";

interface ThemedTextInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
}

export const ThemedTextInput = forwardRef<TextInput, ThemedTextInputProps>(
  ({ style, containerStyle, ...props }, ref) => {
    const { colors } = useTheme();
    const styles = useThemeStyles(createStyles);

    return (
      <View style={[styles.container, containerStyle]}>
        <TextInput
          ref={ref}
          style={[styles.input, props.multiline && styles.textArea, style]}
          placeholderTextColor={colors.iconInactive}
          {...props}
        />
      </View>
    );
  },
);

const createStyles = (colors: ThemeColors, fontSizes: typeof fontSize) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.inputBackground,
      borderRadius: borderRadius.m,
      ...shadows.light,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      width: "100%",
    },
    input: {
      padding: 12,
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.text,
    },
    textArea: {
      minHeight: 112,
      textAlignVertical: "top",
    },
  });
