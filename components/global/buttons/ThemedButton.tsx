import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fonts, type fontSize, shadows, type ThemeColors } from "@/styles";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type ViewStyle,
} from "react-native";

interface ThemedButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  style?: ViewStyle;
}

export function ThemedButton({
  title,
  loading = false,
  style,
  disabled,
  ...props
}: ThemedButtonProps) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        style,
        { opacity: pressed || disabled || loading ? 0.7 : 1 },
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof fontSize) =>
  StyleSheet.create({
    button: {
      width: "100%",
      backgroundColor: colors.primary,
      borderRadius: 10,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
      ...shadows.light,
    },
    text: {
      color: colors.white,
      fontSize: fontSizes.m,
      fontFamily: fonts.primaryBold,
      fontWeight: "600",
    },
  });
