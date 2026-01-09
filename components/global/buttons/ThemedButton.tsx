import { colors, fontSize, fonts, shadows } from "@/styles";
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

const styles = StyleSheet.create({
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
