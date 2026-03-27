import { useThemeStyles } from "@/hooks/useThemeStyles";
import type { ThemeColors } from "@/styles";
import { spacing } from "@/styles";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  style?: any;
}

export function FormField({ label, error, children, style }: FormFieldProps) {
  const styles = useThemeStyles(createStyles);

  return (
    <View style={[styles.field, style]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
      {children}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    field: {
      marginBottom: spacing.lg,
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: spacing.sm,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
    },
  });
