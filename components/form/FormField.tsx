import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fonts, spacing, type ThemeColors } from "@/styles";
import type { ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  style?: ViewStyle;
  counter?: { current: number; max: number };
}

export function FormField({
  label,
  error,
  children,
  style,
  counter,
}: FormFieldProps) {
  const styles = useThemeStyles(createStyles);

  return (
    <View style={[styles.field, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {counter && (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {counter.current}/{counter.max}
            </Text>
          </View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.inputWrapper}>{children}</View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    field: {
      marginBottom: spacing.lg,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      marginBottom: 5,
    },
    label: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      fontFamily: fonts.primaryBold,
    },
    counterBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: colors.border,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    counterText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.text,
      fontFamily: fonts.primary,
    },
    inputWrapper: {
      marginTop: 5,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      marginTop: spacing.sm,
    },
  });
