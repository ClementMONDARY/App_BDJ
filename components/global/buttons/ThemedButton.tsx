import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fontSize, fonts, shadows, type ThemeColors } from "@/styles";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
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

const createStyles = (colors: ThemeColors) =>
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
      fontSize: fontSize.m,
      fontFamily: fonts.primaryBold,
      fontWeight: "600",
    },
  });
