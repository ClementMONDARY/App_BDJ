import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fonts, spacing, type fontSize, type ThemeColors } from "@/styles";
import { StyleSheet, Text, View } from "react-native";

interface QAItemProps {
  question: string;
  answer: string;
}

export function QAItem({ question, answer }: QAItemProps) {
  const styles = useThemeStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof fontSize) =>
  StyleSheet.create({
    container: {
      width: "100%",
      borderRadius: 6,
      gap: 6,
      marginBottom: spacing["2xl"],
    },
    question: {
      color: colors.text,
      fontSize: fontSizes.m,
      fontFamily: fonts.primaryBold,
      textAlign: "left",
    },
    answer: {
      color: colors.textSecondary, // Secondary text for answer might be better
      fontSize: fontSizes.xs,
      fontFamily: fonts.primary,
      lineHeight: 18,
      paddingHorizontal: spacing.md,
    },
  });
